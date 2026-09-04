import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Client } from '../../../../../src/modules/authentication/google/client.ts'

const verifyIdToken = vi.fn()

function createClient(): Client {
	const client = new Client('client-id')
	Reflect.set(client, 'client', { verifyIdToken })
	return client
}

describe('Google authentication client', () => {
	beforeEach(() => verifyIdToken.mockReset())

	it('rejects a mismatching CSRF token before verifying the credential', async () => {
		const client = createClient()
		await expect(client.getIdentity({ credential: 'credential', g_csrf_token: 'one' }, 'two')).resolves.toBeNull()
		expect(verifyIdToken).not.toHaveBeenCalled()
	})

	it('returns a verified Google identity', async () => {
		const identity = { sub: 'subject', email: 'user@example.org', email_verified: true }
		verifyIdToken.mockResolvedValue({ getPayload: () => identity })
		const client = createClient()
		await expect(client.getIdentity({ credential: 'credential', g_csrf_token: 'csrf' }, 'csrf')).resolves.toBe(identity)
		expect(verifyIdToken).toHaveBeenCalledWith({ idToken: 'credential', audience: 'client-id' })
	})

	it.each([undefined, { email: 'user@example.org', email_verified: false }])('rejects a missing or unverified identity', async payload => {
		verifyIdToken.mockResolvedValue({ getPayload: () => payload })
		await expect(createClient().getIdentity({ credential: 'credential' })).resolves.toBeNull()
	})

	it('rejects credentials that fail token verification', async () => {
		const client = new Client('client-id')
		Reflect.set(client, 'client', { verifyIdToken: () => { throw new Error('invalid token') } })
		await expect(client.getIdentity({ credential: 'credential' })).resolves.toBeNull()
	})
})
