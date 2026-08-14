import type { Request } from 'express'
import { AuthenticationError } from 'apollo-server-express'
import type { PubSubEngine } from 'graphql-subscriptions'

import type { ApiContext, ApiLoaders } from '../modules/index.ts'
import type { UserRecord } from '../modules/user/index.ts'
import type { Database } from '../database.ts'
import { createLoaders } from '../graphql/index.ts'

import { getIdFromRequest } from './support.ts'

export interface ApolloContext extends ApiContext {
	db: Database
	isLoggedIn: boolean
	isAdmin: boolean
	userId?: string
	user: UserRecord | null
	ensureLoggedIn: () => void
	ensureAdmin: () => void
	loaders: ApiLoaders
	pubsub: PubSubEngine
}

export function createApolloContext(database: Database, pubsub: PubSubEngine) {
	return async ({ req }: { req: Request }): Promise<ApolloContext> => {
		// Determine whether there is a user.
		const userId = getIdFromRequest(req)
		const user = userId ? await database.User.findByPk(userId) as UserRecord | null : null

		// Set up a context object. Loaders receive the same context object that is returned to Apollo.
		const context: ApolloContext = {
			db: database,
			isLoggedIn: !!user,
			isAdmin: user?.role === 'admin',
			userId,
			user,
			ensureLoggedIn: () => {
				if (!user) throw new AuthenticationError('User not signed in.')
			},
			ensureAdmin: () => {
				if (user?.role !== 'admin') throw new AuthenticationError('No admin rights.')
			},
			loaders: {},
			pubsub,
		}
		context.loaders = createLoaders(context)
		return context
	}
}
