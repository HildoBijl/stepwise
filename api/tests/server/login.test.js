const { createClient, defaultConfig } = require('../client')

const USER_ID = '00000000-0000-0000-0000-000000000000'

const seed = async db => {
	await db.User.create({
		id: USER_ID,
		name: 'Tester',
		email: 'step@wise.com'
	})
	await db.UniversityMembership.create({
		memberId: USER_ID,
	})
}

describe('login', () => {
	it('there is no active session without logging in', async () => {
		const client = await createClient(seed)

		await client.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('establishes session after login and destroys it after logout', async () => {
		const client = await createClient(seed)

		await client
			.login(USER_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client
			.graphql({ query: `{me {name}}` })
			.then(({ data }) => expect(data.me).toEqual({ name: 'Tester' }))

		await client
			.logout()
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client
			.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('doesn’t login unregistered users', async () => {
		// We don’t seed here, so the `USER_ID` is unknown to the system
		const client = await createClient()

		await client
			.login(USER_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(
				expect.stringContaining('error=USER_NOT_FOUND')
			))

		await client.graphql({ query: `{me {name, email}}` })
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

		await client.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})
})
