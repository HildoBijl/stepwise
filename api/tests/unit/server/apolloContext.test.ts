import type { PubSubEngine } from 'graphql-subscriptions'

import { createLoaders } from '../../../src/graphql/index.ts'
import type { ApiLoaders } from '../../../src/modules/index.ts'
import type { UserRecord } from '../../../src/modules/user/index.ts'
import type { Database } from '../../../src/database.ts'
import { ForbiddenError, UnauthenticatedError } from '../../../src/errors.ts'
import { createApolloContext } from '../../../src/server/apolloContext.ts'
import type { RequestWithSession } from '../../../src/server/types.ts'

vi.mock('../../../src/graphql/index.ts', () => ({ createLoaders: vi.fn(() => ({})) }))

function createRequest(userId?: string): RequestWithSession {
	return { session: userId ? { principal: { id: userId } } : {} } as RequestWithSession
}

function setup(user: UserRecord | null) {
	const findByPk = vi.fn().mockResolvedValue(user)
	const db = { User: { findByPk } } as unknown as Database
	const pubsub = { publish: vi.fn() } as unknown as PubSubEngine
	const loaders = { marker: true } as unknown as ApiLoaders
	vi.mocked(createLoaders).mockReturnValue(loaders)
	return { db, findByPk, loaders, provider: createApolloContext(db, pubsub), pubsub }
}

describe('Apollo context', () => {
	beforeEach(() => vi.clearAllMocks())

	it('creates an anonymous context without querying the database', async () => {
		const { db, findByPk, loaders, provider, pubsub } = setup(null)
		const context = await provider({ req: createRequest() })
		expect(findByPk).not.toHaveBeenCalled()
		expect(context).toMatchObject({ db, pubsub, loaders, user: null, isLoggedIn: false, isAdmin: false })
		expect(context.userId).toBeUndefined()
		expect(() => context.ensureLoggedIn()).toThrow(UnauthenticatedError)
		expect(() => context.ensureAdmin()).toThrow(ForbiddenError)
		expect(createLoaders).toHaveBeenCalledWith(expect.objectContaining({ db, pubsub, user: null }))
	})

	it.each(['student', 'teacher'] as const)('creates an authenticated non-admin context for a %s', async role => {
		const user = { id: 'user-id', role } as UserRecord
		const { findByPk, provider } = setup(user)
		const context = await provider({ req: createRequest(user.id) })
		expect(findByPk).toHaveBeenCalledWith(user.id)
		expect(context).toMatchObject({ user, userId: user.id, isLoggedIn: true, isAdmin: false })
		expect(() => context.ensureLoggedIn()).not.toThrow()
		expect(() => context.ensureAdmin()).toThrow(ForbiddenError)
	})

	it('creates an administrator context', async () => {
		const user = { id: 'admin-id', role: 'admin' } as UserRecord
		const { provider } = setup(user)
		const context = await provider({ req: createRequest(user.id) })
		expect(context.isAdmin).toBe(true)
		expect(() => context.ensureAdmin()).not.toThrow()
	})

	it('treats a session for a deleted user as unauthenticated while retaining its session ID', async () => {
		const { provider } = setup(null)
		const context = await provider({ req: createRequest('deleted-id') })
		expect(context).toMatchObject({ userId: 'deleted-id', user: null, isLoggedIn: false, isAdmin: false })
	})
})
