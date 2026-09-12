import { courseFieldResolvers } from './fields.ts'
import { courseMutationResolvers } from './mutations.ts'
import { courseQueryResolvers } from './queries.ts'

export const courseResolvers = {
	...courseFieldResolvers,
	Query: courseQueryResolvers,
	Mutation: courseMutationResolvers,
}
