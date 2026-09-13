import { UniqueConstraintError } from 'sequelize'

import { ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateSkillBasedExerciseInstance } from '@step-wise/exercise-selection'
import { ensureSkillId } from '@step-wise/skill-tree'
import { getExercise, getExercises } from '@step-wise/exercises'

import { InvalidInputError } from '../../../errors.ts'

import { type SkillObservationInput, applySkillObservationsForUser, createSkillResolverSource, getUserSkillLevelSet, skillEvents } from '../../skill/index.ts'

import type { ExerciseContext } from './types.ts'
import { exerciseEvents, getCurrentExerciseState, getExerciseEventIndex, getUserSkillWithExercises, lockActiveExercise } from '../service.ts'

export const exerciseMutationResolvers = {
	startExercise: async (_source: unknown, { skillId: rawSkillId }: { skillId: string }, { db, pubsub, ensureSignedIn, userId }: ExerciseContext) => {
		ensureSignedIn()
		const skillId = ensureSkillId(rawSkillId)
		const skillData = await getUserSkillWithExercises(db, userId, skillId, { includeExercises: true, requireNoActiveExercise: true, createIfNoneExists: true })
		if (!skillData) throw new Error(`Failed to load or create user skill "${skillId}".`)
		const definitions = getExercises(skillId)
		if (!definitions) throw new Error(`Cannot start an exercise for skill "${skillId}": no exercises are available.`)
		const generated = await generateSkillBasedExerciseInstance(definitions, ids => getUserSkillLevelSet(db, userId, ids), skillData.exercises)
		try {
			const exercise = await db.ExerciseSample.create({ userSkillId: skillData.skill.id, exerciseId: generated.exerciseId, parameters: generated.parameters, initialState: generated.initialState, active: true })
			await pubsub.publish(exerciseEvents.exerciseStarted, { updatedExercise: exercise, userId, skillId })
			return exercise
		} catch (error) {
			if (error instanceof UniqueConstraintError) throw new InvalidInputError(`There is still an active exercise for skill "${skillId}".`)
			throw error
		}
	},

	submitExerciseAction: async (_source: unknown, { exerciseId, eventIndex, action: rawAction }: { exerciseId: string; eventIndex: number; action: unknown }, { db, pubsub, ensureSignedIn, userId }: ExerciseContext) => {
		ensureSignedIn()
		const action = ensureExerciseAction(rawAction)

		// Lock and verify the exact exercise before calculating its next state, then apply all changes atomically.
		const { updatedExercise, updatedSkills, skillId } = await db.transaction(async transaction => {
			const locked = await lockActiveExercise(db, exerciseId, userId, transaction)
			const updatedExercise = locked.exercise
			const skillId = locked.skill.skillId
			const currentEventIndex = getExerciseEventIndex(updatedExercise)
			if (eventIndex !== currentEventIndex) throw new InvalidInputError(`Cannot submit action: exercise event index ${eventIndex} is stale; the current index is ${currentEventIndex}.`)
			const definition = getExercise(skillId, updatedExercise.exerciseId)
			if (!definition) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${updatedExercise.exerciseId}".`)
			if (!definition.processSoloAction) throw new Error(`Unsupported exercise mode: exercise "${updatedExercise.exerciseId}" does not support solo actions.`)
			const skillObservations: SkillObservationInput[] = []
			const state = await definition.processSoloAction({
				parameters: updatedExercise.parameters,
				state: getCurrentExerciseState(updatedExercise),
				action,
				updateSkills: (setup, correct) => { if (setup) skillObservations.push({ setup, correct }) },
			})
			if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${updatedExercise.exerciseId}" due to an error in updating the exercise state.`)
			const updatedSkills = await applySkillObservationsForUser(db, userId, skillObservations, transaction)
			updatedExercise.events.push(await db.ExerciseEvent.create({ exerciseSampleId: updatedExercise.id, eventIndex, action, state }, { transaction }))
			if (isStateDone(state)) {
				await updatedExercise.update({ active: false }, { transaction })
				updatedExercise.active = false
			}
			return { updatedExercise, updatedSkills, skillId }
		})

		// Publish the outcome.
		await pubsub.publish(exerciseEvents.exerciseUpdated, { updatedExercise, userId, skillId })
		await pubsub.publish(skillEvents.skillsUpdated, { userId, updatedSkills })
		return { updatedExercise, updatedSkills: updatedSkills.map(skill => createSkillResolverSource(skill, true)) }
	},
}
