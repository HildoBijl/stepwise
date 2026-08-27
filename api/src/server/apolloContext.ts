import type { PubSubEngine } from 'graphql-subscriptions'

import { ForbiddenError, UnauthenticatedError } from '../errors.ts'
import type { ApiContext, ApiLoaders, LoaderContext } from '../modules/index.ts'
import type { UserRecord } from '../modules/user/index.ts'
import type { Database } from '../database.ts'
import { createLoaders } from '../graphql/index.ts'

import type { RequestWithSession } from './types.ts'
import { getSessionUserId } from './support.ts'

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
export type ApolloContextProvider = (options: { req: RequestWithSession }) => Promise<ApolloContext>

export function createApolloContext(db: Database, pubsub: PubSubEngine): ApolloContextProvider {
	return async ({ req }: { req: RequestWithSession }): Promise<ApolloContext> => {
		// Determine whether there is a user.
		const userId = getSessionUserId(req)
		const user = userId ? await db.User.findByPk(userId) : null

		// Set up a context object. Loaders receive the same context object that is returned to Apollo.
		const context: LoaderContext = {
			db,
			isLoggedIn: !!user,
			isAdmin: user?.role === 'admin',
			...(userId ? { userId } : {}),
			user,
			ensureLoggedIn: () => {
				if (!user) throw new UnauthenticatedError('User not signed in.')
			},
			ensureAdmin: () => {
				if (user?.role !== 'admin') throw new ForbiddenError('No admin rights.')
			},
			pubsub,
		}
		return { ...context, loaders: createLoaders(context) }
	}
}
