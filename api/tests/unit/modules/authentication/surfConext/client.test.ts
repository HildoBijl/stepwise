import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Client } from '../../../../../src/modules/authentication/surfConext/client.ts'

const openIdMocks = vi.hoisted(() => ({
	authorizationCodeGrant: vi.fn(),
	buildAuthorizationUrl: vi.fn(),
	discovery: vi.fn(),
	fetchUserInfo: vi.fn(),
}))

vi.mock('openid-client', () => openIdMocks)

const issuerUrl = 'https://connect.example.test'
const redirectUrl = 'https://api.example.test/auth/surfconext/callback'
const clientId = 'client-id'
const secret = 'client-secret'
const identityProviderHints = {
	hu: 'https://hu.example.test',
	eduid: 'https://eduid.example.test',
}
const configuration = { configuration: true }

function createClient(): Client {
	return new Client(issuerUrl, redirectUrl, clientId, secret, identityProviderHints)
}

describe('SurfConext Client', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		openIdMocks.discovery.mockResolvedValue(configuration)
	})

	it('discovers and configures the OpenID client', async () => {
		openIdMocks.buildAuthorizationUrl.mockReturnValue(new URL('https://connect.example.test/authorize'))

		await createClient().authorizationUrl('session-id')

		expect(openIdMocks.discovery).toHaveBeenCalledWith(new URL(issuerUrl), clientId, {
			client_secret: secret,
			redirect_uris: [redirectUrl],
			response_types: ['code'],
		})
	})

	it.each([
		['hu', identityProviderHints.hu],
		['eduid', identityProviderHints.eduid],
	] as const)('adds the %s identity-provider hint to the authorization URL', async (identityProvider, loginHint) => {
		openIdMocks.buildAuthorizationUrl.mockReturnValue(new URL('https://connect.example.test/authorize'))

		await createClient().authorizationUrl('session-id', identityProvider)

		expect(openIdMocks.buildAuthorizationUrl).toHaveBeenCalledWith(configuration, {
			redirect_uri: redirectUrl,
			scope: 'openid',
			state: createHash('sha256').update('session-id').digest('hex'),
			login_hint: loginHint,
		})
	})

	it('omits the identity-provider hint for general sign-in', async () => {
		openIdMocks.buildAuthorizationUrl.mockReturnValue(new URL('https://connect.example.test/authorize'))

		await createClient().authorizationUrl('session-id')

		expect(openIdMocks.buildAuthorizationUrl).toHaveBeenCalledWith(configuration, {
			redirect_uri: redirectUrl,
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
		expect(openIdMocks.discovery).not.toHaveBeenCalled()
	})

	it('validates the callback and returns the user information', async () => {
		const identity = { sub: 'subject', email: 'user@example.test' }
		openIdMocks.authorizationCodeGrant.mockResolvedValue({
			access_token: 'access-token',
			claims: () => ({ sub: identity.sub }),
		})
		openIdMocks.fetchUserInfo.mockResolvedValue(identity)

		await expect(createClient().getIdentity({ state: 'state', code: 'code' }, 'session-id')).resolves.toEqual(identity)

		const callbackUrl = new URL(redirectUrl)
		callbackUrl.searchParams.set('state', 'state')
		callbackUrl.searchParams.set('code', 'code')
		expect(openIdMocks.authorizationCodeGrant).toHaveBeenCalledWith(
			configuration,
			callbackUrl,
			{
				expectedState: createHash('sha256').update('session-id').digest('hex'),
				idTokenExpected: true,
			},
		)
		expect(openIdMocks.fetchUserInfo).toHaveBeenCalledWith(configuration, 'access-token', identity.sub)
	})

	it.each([
		{ access_token: undefined, claims: () => ({ sub: 'subject' }) },
		{ access_token: 'access-token', claims: () => undefined },
	])('rejects token responses without the information needed for UserInfo validation', async tokens => {
		openIdMocks.authorizationCodeGrant.mockResolvedValue(tokens)

		await expect(createClient().getIdentity({ state: 'state', code: 'code' }, 'session-id')).resolves.toBeNull()
		expect(openIdMocks.fetchUserInfo).not.toHaveBeenCalled()
	})

	it('rejects invalid user information', async () => {
		openIdMocks.authorizationCodeGrant.mockResolvedValue({
			access_token: 'access-token',
			claims: () => ({ sub: 'subject' }),
		})
		openIdMocks.fetchUserInfo.mockResolvedValue({ email: 'user@example.test' })

		await expect(createClient().getIdentity({ state: 'state', code: 'code' }, 'session-id')).resolves.toBeNull()
	})
})
