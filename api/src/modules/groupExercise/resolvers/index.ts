import { groupExerciseFieldResolvers } from './fields.ts'
import { groupExerciseMutationResolvers } from './mutations.ts'
import { groupExerciseQueryResolvers } from './queries.ts'
import { groupExerciseSubscriptionResolvers } from './subscriptions.ts'

export const groupExerciseResolvers = {
	...groupExerciseFieldResolvers,
	Query: groupExerciseQueryResolvers,
	Mutation: groupExerciseMutationResolvers,
	Subscription: groupExerciseSubscriptionResolvers,
}
