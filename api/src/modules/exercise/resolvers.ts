import { type Transaction, UniqueConstraintError } from 'sequelize'

import { ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateSkillBasedExerciseInstance } from '@step-wise/exercise-selection'
import { ensureSkillId } from '@step-wise/skill-tree'
import { getExercise, getExercises } from '@step-wise/exercises'

import { UserInputError } from '../../errors.ts'

import type { AuthenticatedContext } from '../user/index.ts'
import { type SkillObservationInput, type UserSkillRecord, applySkillObservationsForUser, getUserSkillLevelSet, skillEvents } from '../skill/index.ts'

import { type ExerciseEventRecord, type ExerciseSampleRecord, type ExerciseSampleWithEvents, hasLoadedExerciseEvents } from './models.ts'
import { type ExerciseDatabase, getCurrentExerciseState, getLatestExerciseEvent, getUserSkillWithExercises } from './service.ts'

type ExerciseContext = Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn' | 'loaders' | 'pubsub' | 'userId'>

async function lockActiveExercise(db: ExerciseDatabase, exerciseId: string, skillId: string, transaction: Transaction): Promise<ExerciseSampleWithEvents> {
	const exercise = await db.ExerciseSample.findByPk(exerciseId, { transaction, lock: transaction.LOCK.UPDATE })
	if (!exercise || !exercise.active) throw new UserInputError(`Cannot submit action: there is no longer an active exercise for skill "${skillId}".`)
	exercise.events = await db.ExerciseEvent.findAll({ where: { exerciseSampleId: exercise.id }, order: [['createdAt', 'ASC']], transaction })
	if (!hasLoadedExerciseEvents(exercise)) throw new Error(`Failed to load events for exercise "${exercise.id}".`)
	return exercise
}

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
		startedAt: (exercise: ExerciseSampleRecord) => exercise.createdAt,
		state: getCurrentExerciseState,
		lastAction: (exercise: ExerciseSampleRecord) => getLatestExerciseEvent(exercise)?.action ?? null,
		lastActionAt: (exercise: ExerciseSampleRecord) => getLatestExerciseEvent(exercise)?.createdAt ?? null,
		history: (exercise: ExerciseSampleRecord) => exercise.events ?? [],
		active: (exercise: ExerciseSampleRecord) => exercise.active,
	},
	ExerciseEvent: { performedAt: (event: ExerciseEventRecord) => event.createdAt },

	Mutation: {
		startExercise: async (_source: unknown, { skillId: rawSkillId }: { skillId: string }, { db, ensureLoggedIn, userId }: ExerciseContext) => {
			ensureLoggedIn()
			const skillId = ensureSkillId(rawSkillId)
			const skillData = await getUserSkillWithExercises(db, userId, skillId, { includeExercises: true, requireNoActiveExercise: true, createIfNoneExists: true })
			if (!skillData) throw new Error(`Failed to load or create user skill "${skillId}".`)
			const definitions = getExercises(skillId)
			if (!definitions) throw new Error(`Cannot start an exercise for skill "${skillId}": no exercises are available.`)
			const generated = await generateSkillBasedExerciseInstance(definitions, ids => getUserSkillLevelSet(db, userId, ids), skillData.exercises)
			try {
				return await db.ExerciseSample.create({ userSkillId: skillData.skill.id, exerciseId: generated.exerciseId, parameters: generated.parameters, initialState: generated.initialState, active: true })
			} catch (error) {
				if (error instanceof UniqueConstraintError) throw new UserInputError(`There is still an active exercise for skill "${skillId}".`)
				throw error
			}
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
			const processSoloAction = definition.processSoloAction

			// Lock and reload the exercise before calculating its next state, then apply all changes atomically.
			let updatedExercise: ExerciseSampleWithEvents = activeExercise
			let updatedSkills: UserSkillRecord[] = []
			await db.transaction(async transaction => {
				updatedExercise = await lockActiveExercise(db, activeExercise.id, skillId, transaction)
				const skillObservations: SkillObservationInput[] = []
				const state = processSoloAction({
					parameters: updatedExercise.parameters,
					state: getCurrentExerciseState(updatedExercise),
					action,
					updateSkills: (setup, correct) => { if (setup) skillObservations.push({ setup, correct }) },
				})
				if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${updatedExercise.exerciseId}" due to an error in updating the exercise state.`)
				updatedSkills = await applySkillObservationsForUser(db, userId, skillObservations, transaction)
				updatedExercise.events.push(await db.ExerciseEvent.create({ exerciseSampleId: updatedExercise.id, action, state }, { transaction }))
				if (isStateDone(state)) {
					await updatedExercise.update({ active: false }, { transaction })
					updatedExercise.active = false
				}
			})

			// Publish the outcome.
			await pubsub.publish(skillEvents.skillsUpdated, { userId, updatedSkills })
			return { updatedExercise, updatedSkills }
		},
	},
}
