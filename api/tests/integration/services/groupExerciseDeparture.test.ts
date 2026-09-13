import type { PubSubEngine } from 'graphql-subscriptions'
import { describe, expect, it, vi } from 'vitest'

import { getGroupExerciseActionUserId, getGroupExerciseById, prepareGroupMemberDeparture } from '../../../src/modules/groupExercise/index.ts'
import { hasLoadedGroupMembers } from '../../../src/modules/group/index.ts'

import { integrationDatabase as db } from '../../support/integrationDatabase.ts'

const LEAVING_USER_ID = 'a0000000-0000-0000-0000-000000000000'
const REMAINING_USER_ID = 'b0000000-0000-0000-0000-000000000000'

function createPubsub() {
	return { publish: vi.fn(async () => undefined) } as unknown as PubSubEngine
}

describe('group exercise departure', () => {
	it('deletes pending actions and anonymizes resolved history consistently', async () => {
		const leavingUser = await db.User.create({ id: LEAVING_USER_ID, email: 'leaving@example.com' })
		const remainingUser = await db.User.create({ id: REMAINING_USER_ID, email: 'remaining@example.com' })
		const group = await db.Group.create({ code: 'ANON' })
		await group.addMember(leavingUser.id)
		await group.addMember(remainingUser.id)
		const exercise = await db.GroupExerciseSample.create({ groupId: group.id, skillId: 'enterInteger', exerciseId: 'enterInteger', parameters: {} })
		const resolvedEvent = await exercise.createEvent({
			eventIndex: 0,
			state: {
				attemptedBy: [LEAVING_USER_ID, REMAINING_USER_ID],
				inputDependencies: { [LEAVING_USER_ID]: { direction: -1 }, [REMAINING_USER_ID]: { direction: 1 } },
			},
		})
		await resolvedEvent.createAction({ userId: LEAVING_USER_ID, action: { type: 'input', input: { x: 1 } } })
		await resolvedEvent.createAction({ userId: REMAINING_USER_ID, action: { type: 'input', input: { y: 2 }, adoptUserHistory: LEAVING_USER_ID } })
		const pendingEvent = await exercise.createEvent({ eventIndex: 1, state: null })
		await pendingEvent.createAction({ userId: LEAVING_USER_ID, action: { type: 'input', input: { z: 3 } } })
		await pendingEvent.createAction({ userId: REMAINING_USER_ID, action: { type: 'input', input: { z: 4 }, adoptUserHistory: LEAVING_USER_ID } })

		const pubsub = createPubsub()
		const publish = await db.transaction(async transaction => {
			const loadedGroup = await db.Group.findByPk(group.id, { include: { association: 'members' }, transaction })
			if (loadedGroup && !hasLoadedGroupMembers(loadedGroup)) throw new Error('Failed to load group members.')
			if (!loadedGroup) throw new Error('Failed to load group.')
			loadedGroup.members = loadedGroup.members.filter(member => member.id !== LEAVING_USER_ID)
			return await prepareGroupMemberDeparture(db, loadedGroup, LEAVING_USER_ID, transaction, pubsub)
		})
		await publish()

		const updatedExercise = await getGroupExerciseById(db, exercise.id)
		expect(updatedExercise).not.toBeNull()
		const [updatedResolvedEvent, updatedPendingEvent] = updatedExercise!.events
		if (!updatedResolvedEvent || !updatedPendingEvent) throw new Error('Failed to reload both exercise events.')
		const anonymousAction = updatedResolvedEvent.actions.find(action => action.anonymousUserId !== null)
		expect(anonymousAction?.userId).toBeNull()
		const anonymousUserId = getGroupExerciseActionUserId(anonymousAction!)
		expect(anonymousUserId).not.toBe(LEAVING_USER_ID)
		expect(updatedResolvedEvent.actions.find(action => action.userId === REMAINING_USER_ID)?.action.adoptUserHistory).toBe(anonymousUserId)
		expect(updatedPendingEvent.actions).toHaveLength(1)
		const remainingPendingAction = updatedPendingEvent.actions[0]
		if (!remainingPendingAction) throw new Error('Failed to retain the remaining user pending action.')
		expect(remainingPendingAction.userId).toBe(REMAINING_USER_ID)
		expect(remainingPendingAction.action.adoptUserHistory).toBe(anonymousUserId)
		expect(updatedResolvedEvent.state).toEqual({
			attemptedBy: [anonymousUserId, REMAINING_USER_ID],
			inputDependencies: { [anonymousUserId]: { direction: -1 }, [REMAINING_USER_ID]: { direction: 1 } },
		})
		expect(pubsub.publish).toHaveBeenCalledTimes(2)
	})
})