import { type Transaction, UniqueConstraintError } from 'sequelize'

import { type SkillId } from '@step-wise/module-tree-definition'
import { ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateSkillBasedExerciseInstance } from '@step-wise/exercise-selection'
import { ensureSkillId } from '@step-wise/module-tree'
import { getExercise, getExercises } from '@step-wise/exercises'

import { ForbiddenError, InvalidInputError } from '../../../errors.ts'

import { type SkillObservationInput, type UserSkillRecord, applySkillObservationsForUser, createSkillResolverSource, getUserSkillLevelSet, skillEvents } from '../../skill/index.ts'

import { isExerciseCompatible } from '../compatibility.ts'
import { type ExerciseSampleWithEvents, hasLoadedExerciseEvents } from '../models.ts'
import { type ExerciseDatabase, exerciseEvents, getCurrentExerciseState, getExerciseEventIndex, getUserSkillWithExercises } from '../service.ts'

import type { ExerciseContext } from './types.ts'

export const exerciseMutationResolvers = {
	startExercise: async (_source: unknown, { skillId: rawSkillId }: { skillId: string }, { db, pubsub, ensureSignedIn, userId }: ExerciseContext) => {
		// Load in the skill and verify that there are no active exercises.
		ensureSignedIn()
		const skillId = ensureSkillId(rawSkillId)
		const skillData = await getUserSkillWithExercises(db, userId, skillId, { includeExercises: true, requireNoActiveExercise: true, createIfNoneExists: true })
		if (!skillData) throw new Error(`Failed to load or create user skill "${skillId}".`)
		const definitions = getExercises(skillId)
		if (!definitions) throw new Error(`Cannot start an exercise for skill "${skillId}": no exercises are available.`)

		// Generate an exercise. Use a skill-based selection algorithm.
		const loadSkillLevelSet = (ids: SkillId[]) => getUserSkillLevelSet(db, userId, ids)
		const generated = await generateSkillBasedExerciseInstance(definitions, loadSkillLevelSet, skillData.exercises)

		// Store the exercise in the database.
		try {
			const exercise = await db.transaction(async transaction => {
				// If there is an exercise in the database that wasn't loaded before, it has to be a stale one. Deactivate it.
				const activeExercise = await db.ExerciseSample.findOne({ where: { userSkillId: skillData.skill.id, active: true }, transaction, lock: transaction.LOCK.UPDATE })
				if (activeExercise) {
					if (isExerciseCompatible(skillId, activeExercise)) throw new InvalidInputError(`There is still an active exercise for skill "${skillId}".`)
					await activeExercise.update({ active: false }, { transaction })
				}

				// Save the new exercise into the database.
				return db.ExerciseSample.create({ userSkillId: skillData.skill.id, exerciseId: generated.exerciseId, exerciseVersion: generated.exerciseVersion, parameters: generated.parameters, initialState: generated.initialState, active: true }, { transaction })
			})

			// Publish update data so the frontend can apply it to the cache.
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
			const locked = await lockActiveExerciseForAction(db, exerciseId, userId, transaction)
			const updatedExercise = locked.exercise
			const skillId = locked.skill.skillId
			const currentEventIndex = getExerciseEventIndex(updatedExercise)
			if (eventIndex !== currentEventIndex) throw new InvalidInputError(`Cannot submit action: exercise event index ${eventIndex} is stale; the current index is ${currentEventIndex}.`)
			const definition = getExercise(skillId, updatedExercise.exerciseId)
			if (!definition) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${updatedExercise.exerciseId}".`)
			if (!definition.processSoloAction) throw new Error(`Unsupported exercise mode: exercise "${updatedExercise.exerciseId}" does not support solo actions.`)
			const skillObservations: SkillObservationInput[] = []
			const { state, report } = await definition.processSoloAction({
				parameters: updatedExercise.parameters,
				context: undefined,
				state: getCurrentExerciseState(updatedExercise),
				action,
				updateSkills: (setup, correct) => { if (setup) skillObservations.push({ setup, correct }) },
			})
			if (!state) throw new Error(`Invalid state object: could not process action for skill "${skillId}" exerciseId "${updatedExercise.exerciseId}" due to an error in updating the exercise state.`)
			const updatedSkills = await applySkillObservationsForUser(db, userId, skillObservations, transaction)
			updatedExercise.events.push(await db.ExerciseEvent.create({ exerciseSampleId: updatedExercise.id, eventIndex, action, state, report: report ?? null }, { transaction }))
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

async function lockActiveExerciseForAction(db: ExerciseDatabase, exerciseId: string, userId: string, transaction: Transaction): Promise<{ exercise: ExerciseSampleWithEvents; skill: UserSkillRecord }> {
	const exercise = await db.ExerciseSample.findByPk(exerciseId, { transaction, lock: transaction.LOCK.UPDATE })
	if (!exercise || !exercise.active) throw new InvalidInputError(`Cannot submit action: exercise "${exerciseId}" is not active.`)
	const skill = await db.UserSkill.findByPk(exercise.userSkillId, { transaction })
	if (!skill) throw new Error(`Failed to load the skill for exercise "${exerciseId}".`)
	if (skill.userId !== userId) throw new ForbiddenError(`Cannot submit action: exercise "${exerciseId}" does not belong to the signed-in user.`)
	if (!isExerciseCompatible(skill.skillId, exercise)) throw new InvalidInputError(`Cannot submit action: exercise "${exerciseId}" is stale.`)
	exercise.events = await db.ExerciseEvent.findAll({ where: { exerciseSampleId: exercise.id }, order: [['eventIndex', 'ASC']], transaction })
	if (!hasLoadedExerciseEvents(exercise)) throw new Error(`Failed to load events for exercise "${exercise.id}".`)
	return { exercise, skill }
}
