import { InvalidInputError } from '../../../errors.ts'

import { createSubscriptionResolver } from '../../subscriptions.ts'
import { ensureGroupMembership, getGroup, hasLoadedGroupMembers } from '../../group/index.ts'

import type { GroupExerciseSampleWithEvents } from '../models.ts'
import { type GroupActionUpdatedPayload, type GroupEventResolvedPayload, type GroupExerciseStartedPayload, getGroupExerciseById, groupExerciseEvents } from '../service.ts'
import type { GroupExerciseContext, GroupExerciseStartedArgs, GroupExerciseSubscriptionArgs } from './types.ts'

export const groupExerciseSubscriptionResolvers = {
	...createSubscriptionResolver('groupExerciseStarted', [groupExerciseEvents.groupExerciseStarted], selectStartedGroupExercise, async ({ code }: GroupExerciseStartedArgs, { db, ensureSignedIn, userId }: GroupExerciseContext) => {
		ensureSignedIn()
		ensureGroupMembership(await getGroup(db, code, { includeMembers: true }), userId)
	}),
	...createSubscriptionResolver('groupActionUpdated', [groupExerciseEvents.groupActionUpdated], selectGroupActionUpdate, authorizeGroupExerciseSubscription),
	...createSubscriptionResolver('groupEventResolved', [groupExerciseEvents.groupEventResolved], selectGroupEventResolution, authorizeGroupExerciseSubscription),
}

export function selectStartedGroupExercise({ exercise, code: eventCode, memberIds }: GroupExerciseStartedPayload, { code, skillId }: GroupExerciseStartedArgs, { userId }: GroupExerciseContext): GroupExerciseSampleWithEvents | undefined {
	if (memberIds.includes(userId) && eventCode === code.toUpperCase() && exercise.skillId === skillId) return exercise
}

export function selectGroupActionUpdate(payload: GroupActionUpdatedPayload, { exerciseId }: GroupExerciseSubscriptionArgs, { userId }: GroupExerciseContext): GroupActionUpdatedPayload | undefined {
	if (payload.memberIds.includes(userId) && payload.exerciseId === exerciseId) return payload
}

export function selectGroupEventResolution(payload: GroupEventResolvedPayload, { exerciseId }: GroupExerciseSubscriptionArgs, { userId }: GroupExerciseContext): GroupEventResolvedPayload | undefined {
	if (payload.memberIds.includes(userId) && payload.exerciseId === exerciseId) return payload
}

async function authorizeGroupExerciseSubscription({ exerciseId }: GroupExerciseSubscriptionArgs, { db, ensureSignedIn, userId }: GroupExerciseContext): Promise<void> {
	ensureSignedIn()
	const exercise = await getGroupExerciseById(db, exerciseId)
	if (!exercise) throw new InvalidInputError(`No group exercise with ID "${exerciseId}" exists.`)
	const group = await db.Group.findByPk(exercise.groupId, { include: { association: 'members' } })
	if (group && !hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
	ensureGroupMembership(group, userId)
}
