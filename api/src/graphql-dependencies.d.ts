declare module '@graphql-tools/schema' {
	import type { GraphQLSchema } from 'graphql'

	export function makeExecutableSchema(options: { typeDefs: unknown, resolvers?: unknown }): GraphQLSchema
}

declare module 'graphql-scalars' {
	import type { GraphQLScalarType } from 'graphql'

	export const DateTimeResolver: GraphQLScalarType
	export const EmailAddressResolver: GraphQLScalarType
	export const JSONResolver: GraphQLScalarType
}
