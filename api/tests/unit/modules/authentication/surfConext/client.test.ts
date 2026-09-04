import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Client } from '../../../../../src/modules/authentication/surfConext/client.ts'

const openIdMocks = vi.hoisted(() => ({
	discover: vi.fn(),
	constructor: vi.fn(),
	authorizationUrl: vi.fn(),
	callback: vi.fn(),
	userinfo: vi.fn(),
}))

vi.mock('openid-client', () => ({
	Issuer: {
		discover: openIdMocks.discover,
	},
}))

const issuerUrl = 'https://connect.example.test'
const redirectUrl = 'https://api.example.test/auth/surfconext/callback'
const clientId = 'client-id'
const secret = 'client-secret'
const identityProviderHints = {
	hu: 'https://hu.example.test',
	eduid: 'https://eduid.example.test',
}

function createClient(): Client {
	return new Client(issuerUrl, redirectUrl, clientId, secret, identityProviderHints)
}

describe('SurfConext Client', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		openIdMocks.discover.mockResolvedValue({
			Client: class {
				constructor(metadata: unknown) {
					openIdMocks.constructor(metadata)
				}

				authorizationUrl = openIdMocks.authorizationUrl
				callback = openIdMocks.callback
				userinfo = openIdMocks.userinfo
			},
		})
	})

	it('discovers and configures the OpenID client', async () => {
		openIdMocks.authorizationUrl.mockReturnValue('https://connect.example.test/authorize')

		await createClient().authorizationUrl('session-id')

		expect(openIdMocks.discover).toHaveBeenCalledWith(issuerUrl)
		expect(openIdMocks.constructor).toHaveBeenCalledWith({
			client_id: clientId,
			client_secret: secret,
			redirect_uris: [redirectUrl],
			response_types: ['code'],
		})
	})

	it.each([
		['hu', identityProviderHints.hu],
		['eduid', identityProviderHints.eduid],
	] as const)('adds the %s identity-provider hint to the authorization URL', async (identityProvider, loginHint) => {
		openIdMocks.authorizationUrl.mockReturnValue('https://connect.example.test/authorize')

		await createClient().authorizationUrl('session-id', identityProvider)

		expect(openIdMocks.authorizationUrl).toHaveBeenCalledWith({
			scope: 'openid',
			state: createHash('sha256').update('session-id').digest('hex'),
			login_hint: loginHint,
		})
	})

	it('omits the identity-provider hint for general sign-in', async () => {
		openIdMocks.authorizationUrl.mockReturnValue('https://connect.example.test/authorize')

		await createClient().authorizationUrl('session-id')

		expect(openIdMocks.authorizationUrl).toHaveBeenCalledWith({
			scope: 'openid',
			state: createHash('sha256').update('session-id').digest('hex'),
		})
	})

	it.each([
		{},
		{ state: 'state' },
		{ code: 'code' },
		{ state: 123, code: 'code' },
		{ state: 'state', code: 123 },
	])('rejects invalid callback parameters', async params => {
		await expect(createClient().getIdentity(params, 'session-id')).resolves.toBeNull()
		expect(openIdMocks.discover).not.toHaveBeenCalled()
	})

	it('validates the callback and returns the user information', async () => {
		const tokenSet = { access_token: 'access-token' }
		const identity = { sub: 'subject', email: 'user@example.test' }
		openIdMocks.callback.mockResolvedValue(tokenSet)
		openIdMocks.userinfo.mockResolvedValue(identity)

		await expect(createClient().getIdentity({ state: 'state', code: 'code' }, 'session-id')).resolves.toEqual(identity)

		expect(openIdMocks.callback).toHaveBeenCalledWith(
			redirectUrl,
			{ state: 'state', code: 'code' },
			{ state: createHash('sha256').update('session-id').digest('hex') },
		)
		expect(openIdMocks.userinfo).toHaveBeenCalledWith(tokenSet)
	})

	it('rejects invalid user information', async () => {
		openIdMocks.callback.mockResolvedValue({ access_token: 'access-token' })
		openIdMocks.userinfo.mockResolvedValue({ email: 'user@example.test' })

		await expect(createClient().getIdentity({ state: 'state', code: 'code' }, 'session-id')).resolves.toBeNull()
	})
})
