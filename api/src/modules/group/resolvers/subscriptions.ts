import { createSubscriptionResolver } from '../../subscriptions.ts'

import { type GroupUpdatedPayload, ensureGroupMembership, getGroup, groupEvents } from '../service.ts'
import type { AuthenticatedGroupContext } from './types.ts'

export const groupSubscriptionResolvers = {
	...createSubscriptionResolver('groupUpdated', [groupEvents.groupUpdated], ({ updatedGroup }: GroupUpdatedPayload, { code }: { code: string }) => {
		// Only pass on when the code matches.
		if (updatedGroup.code === code.toUpperCase()) return updatedGroup
	}, async ({ code }: { code: string }, { db, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
		ensureSignedIn()
		ensureGroupMembership(await getGroup(db, code, { includeMembers: true }), userId)
	}),

	...createSubscriptionResolver('myActiveGroupUpdated', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId, removedForUser }: GroupUpdatedPayload, _args: unknown, { userId }: AuthenticatedGroupContext) => {
		// Removal updates must reach the affected user even though that user is no longer active in the group.
		if (userId === eventUserId && removedForUser) return updatedGroup

		// If this is the user's active group, also pass it on.
		const member = updatedGroup.members.find(member => member.id === userId)
		if (member?.groupMembership.active) return updatedGroup
	}),

	...createSubscriptionResolver('myGroupsUpdated', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId }: GroupUpdatedPayload, _args: unknown, { userId }: AuthenticatedGroupContext) => {
		// Pass on updates caused by the user, plus updates to any group of which the user remains a member.
		if (userId === eventUserId || updatedGroup.members.some(member => member.id === userId)) return updatedGroup
	}),
}
