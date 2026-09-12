import { exerciseFieldResolvers } from './fields.ts'
import { exerciseMutationResolvers } from './mutations.ts'
import { exerciseSubscriptionResolvers } from './subscriptions.ts'

export const exerciseResolvers = {
	...exerciseFieldResolvers,
	Mutation: exerciseMutationResolvers,
	Subscription: exerciseSubscriptionResolvers,
}
