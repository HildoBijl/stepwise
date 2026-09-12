import { ForbiddenError, InvalidInputError } from '../../../errors.ts'

import { createSubscriptionResolver } from '../../subscriptions.ts'

import type { ExerciseSampleRecord } from '../models.ts'
import { type ExerciseUpdatedPayload, exerciseEvents } from '../service.ts'
import type { ExerciseContext, ExerciseStartedArgs, ExerciseUpdatedArgs } from './types.ts'

export const exerciseSubscriptionResolvers = {
	...createSubscriptionResolver(
		'exerciseStarted',
		[exerciseEvents.exerciseStarted],
		selectStartedExercise,
		(_args: ExerciseStartedArgs, { ensureSignedIn }: ExerciseContext) => ensureSignedIn(),
	),

	...createSubscriptionResolver(
		'exerciseUpdated',
		[exerciseEvents.exerciseUpdated],
		selectExerciseUpdate,
		authorizeExerciseSubscription,
	),
}

export function selectStartedExercise({ updatedExercise, userId, skillId }: ExerciseUpdatedPayload, args: ExerciseStartedArgs, context: ExerciseContext): ExerciseSampleRecord | undefined {
	if (userId === context.userId && skillId === args.skillId) return updatedExercise
}

export function selectExerciseUpdate(payload: ExerciseUpdatedPayload, { exerciseId }: ExerciseUpdatedArgs, context: ExerciseContext): ExerciseUpdatedPayload | undefined {
	if (payload.userId === context.userId && payload.updatedExercise.id === exerciseId) return payload
}

async function authorizeExerciseSubscription({ exerciseId }: ExerciseUpdatedArgs, { db, ensureSignedIn, userId }: ExerciseContext): Promise<void> {
	ensureSignedIn()
	const exercise = await db.ExerciseSample.findByPk(exerciseId)
	if (!exercise) throw new InvalidInputError('No exercise with the given ID exists.')
	const skill = await db.UserSkill.findByPk(exercise.userSkillId)
	if (!skill) throw new Error('Failed to load the skill for the exercise.')
	if (skill.userId !== userId) throw new ForbiddenError('Access to the exercise is not allowed.')
}
