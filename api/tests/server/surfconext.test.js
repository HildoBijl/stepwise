const { createClient, defaultConfig } = require('../client')

const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'

const seed = async db => {
	await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Tester',
		email: 'step@wise.com'
	})
	await db.SurfConextProfile.create({
		sub: SPECIAL_USER_ID,
		userId: SPECIAL_USER_ID,
	})
}

describe('SurfConext', () => {
	it('there is no active session without logging in', async () => {
		const client = await createClient(seed)

		await client.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('establishes session after login and destroys it after logout', async () => {
		const client = await createClient(seed)

		await client
			.login(SPECIAL_USER_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client
			.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual({ email: 'step@wise.com' }))

		await client
			.logout()
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client
			.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('doesn’t login unregistered users', async () => {
		// We don’t seed here, so the `SPECIAL_USER_ID` is unknown to the system
		const client = await createClient()

		await client
			.login(SPECIAL_USER_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(
				expect.stringContaining('error=USER_NOT_FOUND')
			))

		await client.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('doesn’t login users with invalid credentials', async () => {
		const client = await createClient(seed)

		// This user-id is not whitelisted in the devLogin strategy,
		// hence the devlogin will return a failing auth response
		const INVALID_DEV_LOGIN_ID = '35f919c4-135b-45cf-b969-1bcc69f9dc31'

		await client
			.login(INVALID_DEV_LOGIN_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(
				expect.stringContaining('error=INVALID_AUTHENTICATION')
			))

		await client.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('creates a new user account if it doesn’t exist', async () => {
		const client = await createClient()

		await client
			.register('00000000-0000-0000-0000-111111111111')
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual({ email: 'john@example.org' }))
	})

	it('just logs someone in when they try to re-register', async () => {
		const client = await createClient(seed)

		await client
			.register(SPECIAL_USER_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual({ email: 'step@wise.com' }))
	})
})
