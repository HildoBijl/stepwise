import { describe, expect, it, vi } from 'vitest'

import type { GoogleAuthDatabase, GoogleAuthRequest, GoogleClient, GoogleIdentity } from '../../../../../src/modules/authentication/google/types.ts'
import { AuthStrategy } from '../../../../../src/modules/authentication/google/authStrategy.ts'
import type { UserRecord } from '../../../../../src/modules/user/index.ts'

const request = { body: { credential: 'credential', g_csrf_token: 'csrf' }, cookies: { g_csrf_token: 'csrf' } } satisfies GoogleAuthRequest

function identity(overrides: Partial<GoogleIdentity> = {}): GoogleIdentity {
	return { iss: 'issuer', aud: 'audience', iat: 1, exp: 2, sub: 'subject', ...overrides }
}

function setup(identity: GoogleIdentity | null, existingUser: UserRecord | null = null) {
	const getIdentity = vi.fn().mockResolvedValue(identity)
	const findOne = vi.fn().mockResolvedValue(existingUser)
	const createdUser = { id: 'created-id' } as UserRecord
	const create = vi.fn().mockResolvedValue(createdUser)
	const db = { User: { findOne, create } } as unknown as GoogleAuthDatabase
	const strategy = new AuthStrategy(db, { getIdentity } as GoogleClient)
	return { create, createdUser, findOne, getIdentity, strategy }
}

describe('Google authentication strategy', () => {
	it('rejects an identity without an email', async () => {
		const { create, findOne, strategy } = setup(identity())
		await expect(strategy.authenticateAndSync(request)).resolves.toBeNull()
		expect(findOne).not.toHaveBeenCalled()
		expect(create).not.toHaveBeenCalled()
	})

	it('returns an existing user without overwriting profile data', async () => {
		const existingUser = { id: 'existing-id' } as UserRecord
		const { create, findOne, strategy } = setup(identity({ email: 'user@example.org', name: 'Google Name' }), existingUser)
		await expect(strategy.authenticateAndSync(request)).resolves.toBe(existingUser)
		expect(findOne).toHaveBeenCalledWith({ where: { email: 'user@example.org' } })
		expect(create).not.toHaveBeenCalled()
	})

	it('creates a new user from a verified identity', async () => {
		const googleIdentity = identity({ email: 'user@example.org', name: 'Full Name', given_name: 'Full', family_name: 'Name' })
		const { create, createdUser, getIdentity, strategy } = setup(googleIdentity)
		await expect(strategy.authenticateAndSync(request)).resolves.toBe(createdUser)
		expect(getIdentity).toHaveBeenCalledWith(request.body, 'csrf')
		expect(create).toHaveBeenCalledWith({ name: 'Full Name', givenName: 'Full', familyName: 'Name', email: 'user@example.org' })
	})

	it('stores absent optional names as null', async () => {
		const { create, strategy } = setup(identity({ email: 'user@example.org' }))
		await strategy.authenticateAndSync(request)
		expect(create).toHaveBeenCalledWith(expect.objectContaining({ name: null, givenName: null, familyName: null }))
	})
})
