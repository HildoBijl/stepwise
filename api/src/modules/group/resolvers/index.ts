import { groupFieldResolvers } from './fields.ts'
import { createGroupMutationResolvers } from './mutations.ts'
import { groupQueryResolvers } from './queries.ts'
import { groupSubscriptionResolvers } from './subscriptions.ts'
import type { CleanUpGroupMember } from './types.ts'

export function createGroupResolvers(cleanUpGroupMember: CleanUpGroupMember) {
	return {
		...groupFieldResolvers,
		Query: groupQueryResolvers,
		Mutation: createGroupMutationResolvers(cleanUpGroupMember),
		Subscription: groupSubscriptionResolvers,
	}
}
