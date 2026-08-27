import { ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateSkillBasedExerciseInstance } from '@step-wise/exercise-selection'
import { ensureSkillId } from '@step-wise/skill-tree'
import { getExercise, getExercises } from '@step-wise/exercises'

import type { AuthenticatedContext } from '../user/index.ts'
import { type SkillUpdate, type UserSkillRecord, applySkillUpdatesForUser, getUserSkillLevelSet, skillEvents } from '../skill/index.ts'

import type { ExerciseEventRecord, ExerciseSampleRecord, ExerciseSampleWithEvents } from './models.ts'
import { getExerciseState, getLastEvent, getUserSkillWithExercises } from './service.ts'

type ExerciseContext = Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn' | 'loaders' | 'pubsub' | 'userId'>

export const exerciseResolvers = {
	Skill: { __resolveType: (skill: UserSkillRecord) => skill.mayViewExercises ? 'SkillWithExercises' : 'SkillWithoutExercises' },
	SkillWithExercises: {
		exercises: (skill: UserSkillRecord, _args: unknown, { loaders }: ExerciseContext) => loaders.exercisesForSkill.load(skill.id),
		activeExercise: async (skill: UserSkillRecord, _args: unknown, { loaders }: ExerciseContext) => {
			const exercises = await loaders.exercisesForSkill.load(skill.id)
			return exercises.find(exercise => exercise.active && !!getExercise(skill.skillId, exercise.exerciseId)) ?? null
		},
	},
	Exercise: {
		mode: () => 'solo',
		startedOn: (exercise: ExerciseSampleRecord) => exercise.createdAt,
		state: getExerciseState,
		lastAction: (exercise: ExerciseSampleRecord) => getLastEvent(exercise)?.action ?? null,
		lastActionAt: (exercise: ExerciseSampleRecord) => getLastEvent(exercise)?.createdAt ?? null,
		history: (exercise: ExerciseSampleRecord) => exercise.events ?? [],
		active: (exercise: ExerciseSampleRecord) => exercise.active,
	},
	Event: { performedAt: (event: ExerciseEventRecord) => event.createdAt },

	Mutation: {
		startExercise: async (_source: unknown, { skillId: rawSkillId }: { skillId: string }, { db, ensureLoggedIn, userId }: ExerciseContext) => {
			ensureLoggedIn()
			const skillId = ensureSkillId(rawSkillId)
			const skillData = await getUserSkillWithExercises(db, userId, skillId, { includeExercises: true, requireNoActiveExercise: true, createIfNoneExists: true })
			if (!skillData) throw new Error(`Failed to load or create user skill "${skillId}".`)
			const definitions = getExercises(skillId)
			if (!definitions) throw new Error(`Cannot start an exercise for skill "${skillId}": no exercises are available.`)
			const generated = await generateSkillBasedExerciseInstance(definitions, ids => getUserSkillLevelSet(db, userId, ids), skillData.exercises)
			return db.ExerciseSample.create({ userSkillId: skillData.skill.id, exerciseId: generated.exerciseId, parameters: generated.parameters, initialState: generated.initialState, active: true })
		},

		submitExerciseAction: async (_source: unknown, { skillId: rawSkillId, action: rawAction }: { skillId: string; action: unknown }, { db, pubsub, ensureLoggedIn, userId }: ExerciseContext) => {
			ensureLoggedIn()
			const skillId = ensureSkillId(rawSkillId)
			const action = ensureExerciseAction(rawAction)

			// Load in the active exercise and its scripts.
			const skillData = await getUserSkillWithExercises(db, userId, skillId, { includeActiveExercise: true, requireActiveExercise: true })
			if (!skillData?.activeExercise) throw new Error(`Failed to load the active exercise for skill "${skillId}".`)
			const activeExercise: ExerciseSampleWithEvents = skillData.activeExercise
			const definition = getExercise(skillId, activeExercise.exerciseId)
			if (!definition) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${activeExercise.exerciseId}".`)
			if (!definition.processSoloAction) throw new Error(`Unsupported exercise mode: exercise "${activeExercise.exerciseId}" does not support solo actions.`)

			// Apply the action to the exerccise.
			const skillUpdates: SkillUpdate[] = []
			const state = definition.processSoloAction({
				parameters: activeExercise.parameters,
				state: getExerciseState(activeExercise),
				action,
				updateSkills: (setup, correct) => { if (setup) skillUpdates.push({ setup, correct }) },
			})
			if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${activeExercise.exerciseId}" due to an error in updating the exercise state.`)

			// Apply potential skill updates.
			let updatedSkills: UserSkillRecord[] = []
			await db.transaction(async transaction => {
				updatedSkills = await applySkillUpdatesForUser(db, userId, skillUpdates, transaction)
				activeExercise.events.push(await db.ExerciseEvent.create({ exerciseSampleId: activeExercise.id, action, state }, { transaction }))
				if (isStateDone(state)) {
					await activeExercise.update({ active: false }, { transaction })
					activeExercise.active = false
				}
			})

			// Publish the outcome.
			await pubsub.publish(skillEvents.skillsUpdated, { userId, updatedSkills })
			return { updatedExercise: activeExercise, updatedSkills }
		},
	},
}
