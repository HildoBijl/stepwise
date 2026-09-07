import { describe, expect, it } from 'vitest'

import { SurfConext } from '../../src/modules/authentication/index.ts'

import { createClient, defaultConfig } from '../support/client.ts'

const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'
const SPECIAL_USER_SURFSUB = '0000000000000000000000000000000000000000'

async function seed(db) {
	const user = await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Step Wise',
		givenName: 'Step',
		familyName: 'Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: SPECIAL_USER_SURFSUB,
	})
}

function flattenUserData(user: { sharedData?: Record<string, unknown>; accountData?: Record<string, unknown>; [key: string]: unknown } | null) {
	if (!user) return user
	const { sharedData, accountData, ...publicData } = user
	return { ...publicData, ...sharedData, ...accountData }
}

describe('Authentication: Session Handling', () => {
	it('there is no active session without signing in', async () => {
		const client = await createClient(seed)

		await expect(client.graphql({ query: `{me {sharedData {email}}}` }).then(({ data }) => flattenUserData(data.me))).resolves.toEqual(null)
	})

	it('establishes session after sign-in and destroys it after sign-out', async () => {
		const client = await createClient(seed)

		await expect(
			client.signInWithSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({ query: `{me {id name sharedData {email}}}` }).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			id: SPECIAL_USER_ID,
			name: 'Step Wise',
			email: 'step@wise.com',
		})

		await expect(
			client.signOut()
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({ query: `{me {sharedData {email}}}` }).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual(null)
	})
})

describe('Authentication: SurfConext', () => {
	it('Updates all user information on every sign-in', async () => {
		const client = await createClient(async db => {
			const user = await db.User.create({
				id: SPECIAL_USER_ID,
				name: 'Old Name',
				email: 'old@email.com',
				givenName: 'Old given name',
				familyName: 'Old family name',
				role: 'teacher',
			})
			await db.SurfConextProfile.create({
				id: SPECIAL_USER_SURFSUB,
				userId: user.id,
			})
		})

		await expect(
			client.signInWithSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {id name givenName familyName sharedData {email} accountData {role}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			id: SPECIAL_USER_ID,
			name: 'Step Wise',
			givenName: 'Step',
			familyName: 'Wise',
			email: 'step@wise.com',
			role: 'student',
		})
	})

	it('preserves locally assigned administrator access', async () => {
		const client = await createClient(async db => {
			const user = await db.User.create({ id: SPECIAL_USER_ID, name: 'Step Wise', email: 'step@wise.com', role: 'admin' })
			await db.SurfConextProfile.create({ id: SPECIAL_USER_SURFSUB, userId: user.id })
		})

		await client.signInWithSurfConext(SPECIAL_USER_SURFSUB)

		await expect(
			client.graphql({ query: '{me {accountData {role}}}' }).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({ role: 'admin' })
	})

	it('automatically creates account for unregistered users', async () => {
		const client = await createClient()

		await expect(
			client.signInWithSurfConext('2222222222222222222222222222222222222222')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName sharedData {email} accountData {role}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			name: 'Prof. Richard Feynman',
			givenName: 'Richard',
			familyName: 'Feynman',
			email: 'r.feynman@mit.edu',
			role: 'teacher',
		})
	})

	it('automatically creates account with minimal user props', async () => {
		const client = await createClient()

		await expect(
			client.signInWithSurfConext('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName sharedData {email} accountData {role}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			name: null,
			givenName: null,
			familyName: null,
			email: 'foo@example.org',
			role: 'student',
		})
	})

	it('does not sign users in with invalid credentials', async () => {
		const client = await createClient(seed)

		// This id is not whitelisted in the SurfConext mock data, therefore the authentication will fail.
		const INVALID_DEV_SIGN_IN_ID = 'ffffffff-ffff-ffff-ffff-123456789012'

		await expect(
			client.signInWithSurfConext(INVALID_DEV_SIGN_IN_ID)
		).resolves.toEqual(
			expect.stringContaining('error=INVALID_AUTHENTICATION')
		)

		await expect(
			client.graphql({ query: `{me {sharedData {email}}}` }).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual(null)
	})

	it('falls back to looking for the email address if it cannot find a SurfConext profile', async () => {
		const client = await createClient(async db => {
			// Seed user, but no associated SurfConext profile.
			await db.User.create({
				id: SPECIAL_USER_ID,
				name: 'Steppy Wisey',
				givenName: 'Steppy',
				familyName: 'Wisey',
				email: 'step@wise.com',
			})
		})

		await expect(
			client.signInWithSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName sharedData {email} accountData {role}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			name: 'Step Wise',
			givenName: 'Step',
			familyName: 'Wise',
			email: 'step@wise.com',
			role: 'student',
		})
	})
})

describe('Authentication: Google', () => {
	it('creates a new user when they sign in via Google and their email is unknown', async () => {
		const client = await createClient(seed)

		await expect(
			client.signInWithGoogle('00112233445566778899')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName sharedData {email} accountData {role}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			name: 'Larry Page',
			givenName: 'Larry',
			familyName: 'Page',
			email: 'larry@google.com',
			role: 'student',
		})
	})

	it('does not overwrite SurfConext data when signing in via Google', async () => {
		const client = await createClient(seed)

		await expect(
			client.signInWithGoogle('99990000555500001111')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName sharedData {email} accountData {role}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			name: 'Step Wise',
			givenName: 'Step',
			familyName: 'Wise',
			email: 'step@wise.com',
			role: 'student',
		})
	})

	it('updates data when signing in via SurfConext after having signed in via Google', async () => {
		const client = await createClient()

		await expect(
			client.signInWithGoogle('99990000555500001111')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {sharedData {email}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			email: 'step@wise.com',
		})

		await client.signOut()

		await expect(
			client.signInWithSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName sharedData {email} accountData {role}}}`
			}).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual({
			name: 'Step Wise',
			givenName: 'Step',
			familyName: 'Wise',
			email: 'step@wise.com',
			role: 'student',
		})
	})

	it('does not sign users in with invalid credentials', async () => {
		const client = await createClient(seed)

		// This id is not whitelisted in the Google mock data, therefore the authentication will fail.
		const INVALID_DEV_SIGN_IN_ID = 'foobar123'

		await expect(
			client.signInWithGoogle(INVALID_DEV_SIGN_IN_ID)
		).resolves.toEqual(
			expect.stringContaining('error=INVALID_AUTHENTICATION')
		)

		await expect(
			client.graphql({ query: `{me {sharedData {email}}}` }).then(({ data }) => flattenUserData(data.me))
		).resolves.toEqual(null)
	})
})

describe('Authentication: Redirects', () => {
	it.each(['hu', 'eduid'] as const)('supports direct %s initiation', async identityProvider => {
		const client = await createClient()

		await expect(client.initiate(undefined, identityProvider)).resolves.toEqual(SurfConext.directoryPath)
	})

	it('redirects users after successful sign-in', async () => {
		const client = await createClient()
		const customRedirectPath = '/my/custom/redirect/route'

		await expect(
			client.initiate(customRedirectPath)
		).resolves.toEqual(SurfConext.directoryPath)

		await expect(
			client.signInWithSurfConext('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl + customRedirectPath)
	})

	it('ignores redirect if it’s not a relative path', async () => {
		const client = await createClient()
		const evilRedirectPath = 'http://evil-site.com'

		await expect(
			client.initiate(evilRedirectPath)
		).resolves.toEqual(SurfConext.directoryPath)

		await expect(
			client.signInWithSurfConext('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl)
	})
})
