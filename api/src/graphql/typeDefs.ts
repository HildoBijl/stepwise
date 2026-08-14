import { gql } from 'apollo-server-express'
import type { DocumentNode } from 'graphql'

import { apiModules } from '../modules/index.ts'

const rootTypeDefs = gql`
	scalar EmailAddress
	scalar DateTime
	scalar JSON

	type Query { _: Boolean }
	type Mutation { _: Boolean }
	type Subscription { _: Boolean }
`

export const typeDefs: DocumentNode[] = [
	rootTypeDefs,
	...apiModules.flatMap(module => module.typeDefs ? [module.typeDefs].flat() : []),
]
