import type { PubSubEngine } from 'graphql-subscriptions'

import { AuthenticationError } from '../errors.ts'
import type { ApiContext, ApiLoaders } from '../modules/index.ts'
import type { UserRecord } from '../modules/user/index.ts'
import type { Database } from '../database.ts'
import { createLoaders } from '../graphql/index.ts'

import type { RequestWithSession } from './types.ts'
import { getIdFromRequest } from './support.ts'

declare module '../modules/types.ts' {
	interface ApiContext {
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
}

export interface ApolloContext extends ApiContext {}

export function createApolloContext(database: Database, pubsub: PubSubEngine) {
	return async ({ req }: { req: RequestWithSession }): Promise<ApolloContext> => {
		// Determine whether there is a user.
		const userId = getIdFromRequest(req)
		const user = userId ? await database.User.findByPk(userId) : null

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
