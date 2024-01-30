const { createClient, defaultConfig } = require('../client')
const { DIRECTORY_PATH } = require('../../src/server/surfConext/devmock')

const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'
const SPECIAL_USER_SURFSUB = '0000000000000000000000000000000000000000'

const seed = async db => {
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

describe('Authentication: Session Handling', () => {
	it('there is no active session without logging in', async () => {
		const client = await createClient(seed)

		await expect(
			client.graphql({query: `{me {email}}`}).then(({data}) => data.me)
		).resolves.toEqual(null)
	})

	it('establishes session after login and destroys it after logout', async () => {
		const client = await createClient(seed)

		await expect(
			client.loginSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({query: `{me {id name email}}`}).then(({data}) => data.me)
		).resolves.toEqual({
			id: SPECIAL_USER_ID,
			name: 'Step Wise',
			email: 'step@wise.com',
		})

		await expect(
			client.logout()
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({query: `{me {email}}`}).then(({data}) => data.me)
		).resolves.toEqual(null)
	})
})

describe('Authentication: SurfConext', () => {
	it('Updates all user information on every login', async () => {
		const client = await createClient(async db => {
			const user = await db.User.create({
				id: SPECIAL_USER_ID,
				name: 'Old Name',
				email: 'old@email.com',
				givenName: 'Old given name',
				familyName: 'Old family name',
			})
			await user.createSurfConextProfile({
				id: SPECIAL_USER_SURFSUB,
			})
		})

		await expect(
			client.loginSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {id name givenName familyName email role}}`
			}).then(({data}) => data.me)
		).resolves.toEqual({
			id: SPECIAL_USER_ID,
			name: 'Step Wise',
			givenName: 'Step',
			familyName: 'Wise',
			email: 'step@wise.com',
			role: 'student',
		})
	})

	it('automatically creates account for unregistered users', async () => {
		const client = await createClient()

		await expect(
			client.loginSurfConext('2222222222222222222222222222222222222222')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName email role}}`
			}).then(({data}) => data.me)
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
			client.loginSurfConext('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName email role}}`
			}).then(({data}) => data.me)
		).resolves.toEqual({
			name: null,
			givenName: null,
			familyName: null,
			email: 'foo@example.org',
			role: 'student',
		})
	})

	it('doesn’t login users with invalid credentials', async () => {
		const client = await createClient(seed)

		// This id is not whitelisted in the SurfConext mock data, therefore the authentication will fail.
		const INVALID_DEV_LOGIN_ID = 'ffffffff-ffff-ffff-ffff-123456789012'

		await expect(
			client.loginSurfConext(INVALID_DEV_LOGIN_ID)
		).resolves.toEqual(
			expect.stringContaining('error=INVALID_AUTHENTICATION')
		)

		await expect(
			client.graphql({query: `{me {email}}`}).then(({data}) => data.me)
		).resolves.toEqual(null)
	})

	it('falls back to looking for the email address if it cannot find a SurfConext profile', async () => {
		const client = await createClient(async db => {
			// Seed user, but no associated SurfConext profile.
			await db.User.create({
				id: SPECIAL_USER_ID,
				name: 'Steppy Wisey',
				firstName: 'Steppy',
				givenName: 'Wisey',
				email: 'step@wise.com',
			})
		})

		await expect(
			client.loginSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName email role}}`
			}).then(({data}) => data.me)
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
			client.loginGoogle('00112233445566778899')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName email role}}`
			}).then(({data}) => data.me)
		).resolves.toEqual({
			name: 'Larry Page',
			givenName: 'Larry',
			familyName: 'Page',
			email: 'larry@google.com',
			role: 'student',
		})
	})

	it('does not overwrite SurfConext data when logging in via Google', async () => {
		const client = await createClient(seed)

		await expect(
			client.loginGoogle('99990000555500001111')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName email role}}`
			}).then(({data}) => data.me)
		).resolves.toEqual({
			name: 'Step Wise',
			givenName: 'Step',
			familyName: 'Wise',
			email: 'step@wise.com',
			role: 'student',
		})
	})

	it('updates data when logging in via SurfConext after having logged in via Google', async () => {
		const client = await createClient()

		await expect(
			client.loginGoogle('99990000555500001111')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {email}}`
			}).then(({data}) => data.me)
		).resolves.toEqual({
			email: 'step@wise.com',
		})

		await client.logout()

		await expect(
			client.loginSurfConext(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({
				query: `{me {name givenName familyName email role}}`
			}).then(({data}) => data.me)
		).resolves.toEqual({
			name: 'Step Wise',
			givenName: 'Step',
			familyName: 'Wise',
			email: 'step@wise.com',
			role: 'student',
		})
	})

	it('doesn’t login users with invalid credentials', async () => {
		const client = await createClient(seed)

		// This id is not whitelisted in the Google mock data, therefore the authentication will fail.
		const INVALID_DEV_LOGIN_ID = 'foobar123'

		await expect(
			client.loginGoogle(INVALID_DEV_LOGIN_ID)
		).resolves.toEqual(
			expect.stringContaining('error=INVALID_AUTHENTICATION')
		)

		await expect(
			client.graphql({query: `{me {email}}`}).then(({data}) => data.me)
		).resolves.toEqual(null)
	})
})

describe('Authentication: Redirects', () => {
	it('redirects users after successful login', async () => {
		const client = await createClient()
		const customRedirectPath = '/my/custom/redirect/route'

		await expect(
			client.initiate(customRedirectPath)
		).resolves.toEqual(DIRECTORY_PATH)

		await expect(
			client.loginSurfConext('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl + customRedirectPath)
	})

	it('ignores redirect if it’s not a relative path', async () => {
		const client = await createClient()
		const evilRedirectPath = 'http://evil-site.com'

		await expect(
			client.initiate(evilRedirectPath)
		).resolves.toEqual(DIRECTORY_PATH)

		await expect(
			client.loginSurfConext('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl)
	})
})
