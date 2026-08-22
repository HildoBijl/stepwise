import { generateSkillBasedExerciseInstance } from '@step-wise/exercise-selection'
import { getExercise, getExercises } from '@step-wise/exercises'
import { ensureSkillId } from '@step-wise/skill-tree'

import { applySkillUpdatesForUser, getUserSkillLevelSet, skillEvents } from '../skill/index.ts'

import { getExerciseState, getLastEvent, getUserSkillWithExercises } from './service.ts'

export const exerciseResolvers: Record<string, any> = {
	Skill: { __resolveType: (skill: any) => skill.mayViewExercises ? 'SkillWithExercises' : 'SkillWithoutExercises' },
	SkillWithExercises: {
		exercises: (skill: any, _args: unknown, { loaders }: any) => loaders.exercisesForSkill.load(skill.id),
		activeExercise: async (skill: any, _args: unknown, { loaders }: any) => {
			const exercises = await loaders.exercisesForSkill.load(skill.id)
			return exercises.find((exercise: any) => exercise.active && !!getExercise(skill.skillId, exercise.exerciseId)) ?? null
		},
	},
	Exercise: {
		mode: () => 'solo',
		startedOn: (exercise: any) => exercise.createdAt,
		state: getExerciseState,
		lastAction: (exercise: any) => getLastEvent(exercise)?.action || null,
		lastActionAt: (exercise: any) => getLastEvent(exercise)?.createdAt || null,
		history: (exercise: any) => exercise.events || [],
		active: (exercise: any) => exercise.active,
	},
	Event: { performedAt: (event: any) => event.createdAt },

	Mutation: {
		startExercise: async (_source: unknown, { skillId }: any, { db, ensureLoggedIn, userId }: any) => {
			ensureLoggedIn()
			ensureSkillId(skillId)
			const { skill, exercises } = (await getUserSkillWithExercises(db, userId, skillId, { includeExercises: true, requireNoActiveExercise: true, createIfNoneExists: true }))!
			const generated = await generateSkillBasedExerciseInstance(getExercises(skillId)!, (ids: string[]) => getUserSkillLevelSet(db, userId, ids), exercises)
			return skill.createExercise({ exerciseId: generated.exerciseId, parameters: generated.parameters, initialState: generated.initialState, active: true })
		},

		submitExerciseAction: async (_source: unknown, { skillId, action }: any, { db, pubsub, ensureLoggedIn, userId }: any) => {
			ensureLoggedIn()

			// Load in the active exercise and its scripts.
			const { activeExercise } = (await getUserSkillWithExercises(db, userId, skillId, { includeActiveExercise: true, requireActiveExercise: true }))!
			const definition = getExercise(skillId, activeExercise.exerciseId)
			if (!definition) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${activeExercise.exerciseId}".`)
			if (!definition.processSoloAction) throw new Error(`Unsupported exercise mode: exercise "${activeExercise.exerciseId}" does not support solo actions.`)

			// Apply the action to the exerccise.
			const skillUpdates: any[] = []
			const state = definition.processSoloAction({
				parameters: activeExercise.parameters,
				state: getExerciseState(activeExercise),
				action,
				updateSkills: (setup: any, correct: boolean) => { if (setup) skillUpdates.push({ setup, correct, userId }) },
			})
			if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${activeExercise.exerciseId}" due to an error in updating the exercise state.`)

			// Apply potential skill updates.
			let updatedSkills: any[] = []
			await db.transaction(async (transaction: any) => {
				updatedSkills = await applySkillUpdatesForUser(db, userId, skillUpdates, transaction)
				activeExercise.events.push(await activeExercise.createEvent({ action, state }, { transaction }))
				if (state.done) {
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
