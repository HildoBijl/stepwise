import { type Transaction, UniqueConstraintError } from 'sequelize'

import { ensureExerciseAction, isStateDone } from '@step-wise/exercise-definition'
import { generateSkillBasedExerciseInstance } from '@step-wise/exercise-selection'
import { ensureSkillId } from '@step-wise/skill-tree'
import { getExercise, getExercises } from '@step-wise/exercises'

import { ForbiddenError, InvalidInputError } from '../../errors.ts'

import type { AuthenticatedContext } from '../user/index.ts'
import { type SkillObservationInput, type SkillResolverSource, type UserSkillRecord, applySkillObservationsForUser, createSkillResolverSource, getUserSkillLevelSet, skillEvents } from '../skill/index.ts'

import { type ExerciseEventRecord, type ExerciseSampleRecord, type ExerciseSampleWithEvents, hasLoadedExerciseEvents } from './models.ts'
import { type ExerciseDatabase, getCurrentExerciseState, getExerciseEventIndex, getLatestExerciseEvent, getUserSkillWithExercises } from './service.ts'

type ExerciseContext = Pick<AuthenticatedContext, 'db' | 'ensureSignedIn' | 'loaders' | 'pubsub' | 'userId'>

async function lockActiveExercise(db: ExerciseDatabase, exerciseId: string, userId: string, transaction: Transaction): Promise<{ exercise: ExerciseSampleWithEvents; skill: UserSkillRecord }> {
	const exercise = await db.ExerciseSample.findByPk(exerciseId, { transaction, lock: transaction.LOCK.UPDATE })
	if (!exercise || !exercise.active) throw new InvalidInputError(`Cannot submit action: exercise "${exerciseId}" is not active.`)
	const skill = await db.UserSkill.findByPk(exercise.userSkillId, { transaction })
	if (!skill) throw new Error(`Failed to load the skill for exercise "${exerciseId}".`)
	if (skill.userId !== userId) throw new ForbiddenError(`Cannot submit action: exercise "${exerciseId}" does not belong to the signed-in user.`)
	exercise.events = await db.ExerciseEvent.findAll({ where: { exerciseSampleId: exercise.id }, order: [['eventIndex', 'ASC']], transaction })
	if (!hasLoadedExerciseEvents(exercise)) throw new Error(`Failed to load events for exercise "${exercise.id}".`)
	return { exercise, skill }
}

export const exerciseResolvers = {
	Skill: { exerciseData: ({ record, mayViewExerciseData }: SkillResolverSource) => mayViewExerciseData ? record : null },

	SkillExerciseData: {
		exercises: (skill: UserSkillRecord, _args: unknown, { loaders }: ExerciseContext) => loaders.exercisesForSkill.load(skill.id),
		latestExercise: async (skill: UserSkillRecord, _args: unknown, { loaders }: ExerciseContext) => {
			const exercise = await loaders.latestExerciseForSkill.load(skill.id)
			return exercise && getExercise(skill.skillId, exercise.exerciseId) ? exercise : null
		},
	},

	Exercise: {
		mode: () => 'solo',
		startedAt: (exercise: ExerciseSampleRecord) => exercise.createdAt,
		state: getCurrentExerciseState,
		eventIndex: getExerciseEventIndex,
		lastAction: (exercise: ExerciseSampleRecord) => getLatestExerciseEvent(exercise)?.action ?? null,
		lastActionAt: (exercise: ExerciseSampleRecord) => getLatestExerciseEvent(exercise)?.createdAt ?? null,
		history: (exercise: ExerciseSampleRecord) => exercise.events ?? [],
		active: (exercise: ExerciseSampleRecord) => exercise.active,
	},
	
	ExerciseEvent: { performedAt: (event: ExerciseEventRecord) => event.createdAt },

	Mutation: {
		startExercise: async (_source: unknown, { skillId: rawSkillId }: { skillId: string }, { db, ensureSignedIn, userId }: ExerciseContext) => {
			ensureSignedIn()
			const skillId = ensureSkillId(rawSkillId)
			const skillData = await getUserSkillWithExercises(db, userId, skillId, { includeExercises: true, requireNoActiveExercise: true, createIfNoneExists: true })
			if (!skillData) throw new Error(`Failed to load or create user skill "${skillId}".`)
			const definitions = getExercises(skillId)
			if (!definitions) throw new Error(`Cannot start an exercise for skill "${skillId}": no exercises are available.`)
			const generated = await generateSkillBasedExerciseInstance(definitions, ids => getUserSkillLevelSet(db, userId, ids), skillData.exercises)
			try {
				return await db.ExerciseSample.create({ userSkillId: skillData.skill.id, exerciseId: generated.exerciseId, parameters: generated.parameters, initialState: generated.initialState, active: true })
			} catch (error) {
				if (error instanceof UniqueConstraintError) throw new InvalidInputError(`There is still an active exercise for skill "${skillId}".`)
				throw error
			}
		},

		submitExerciseAction: async (_source: unknown, { exerciseId, eventIndex, action: rawAction }: { exerciseId: string; eventIndex: number; action: unknown }, { db, pubsub, ensureSignedIn, userId }: ExerciseContext) => {
			ensureSignedIn()
			const action = ensureExerciseAction(rawAction)

			// Lock and verify the exact exercise before calculating its next state, then apply all changes atomically.
			const { updatedExercise, updatedSkills } = await db.transaction(async transaction => {
				const locked = await lockActiveExercise(db, exerciseId, userId, transaction)
				const updatedExercise = locked.exercise
				const skillId = locked.skill.skillId
				const currentEventIndex = getExerciseEventIndex(updatedExercise)
				if (eventIndex !== currentEventIndex) throw new InvalidInputError(`Cannot submit action: exercise event index ${eventIndex} is stale; the current index is ${currentEventIndex}.`)
				const definition = getExercise(skillId, updatedExercise.exerciseId)
				if (!definition) throw new Error(`Invalid exercise: could not load the exercise at skill "${skillId}" with exerciseId "${updatedExercise.exerciseId}".`)
				if (!definition.processSoloAction) throw new Error(`Unsupported exercise mode: exercise "${updatedExercise.exerciseId}" does not support solo actions.`)
				const skillObservations: SkillObservationInput[] = []
				const state = definition.processSoloAction({
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
				return { updatedExercise, updatedSkills }
			})

			// Publish the outcome.
			await pubsub.publish(skillEvents.skillsUpdated, { userId, updatedSkills })
			return { updatedExercise, updatedSkills: updatedSkills.map(skill => createSkillResolverSource(skill, true)) }
		},
	},
}
