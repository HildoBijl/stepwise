const { createClient, defaultConfig } = require('../client')

const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'

const seed = async db => {
	const user = await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Step Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: SPECIAL_USER_ID,
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
			.graphql({ query: `{me {id name email}}` })
			.then(({ data }) => expect(data.me).toEqual({
				id: SPECIAL_USER_ID,
				name: 'Step Wise',
				email: 'step@wise.com',
			}))

		await client
			.logout()
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client
			.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('doesn’t login users with invalid credentials', async () => {
		const client = await createClient(seed)

		// This id is not whitelisted in the SurfConext mock data,
		// therefore the authentication will fail
		const INVALID_DEV_LOGIN_ID = 'ffffffff-ffff-ffff-ffff-123456789012'

		await client
			.login(INVALID_DEV_LOGIN_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(
				expect.stringContaining('error=INVALID_AUTHENTICATION')
			))

		await client.graphql({ query: `{me {email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('Updates the user information on every login', async () => {
		const client = await createClient(async db => {
			const user = await db.User.create({
				id: SPECIAL_USER_ID,
				name: 'Old Name',
				email: 'old@email.com'
			})
			await user.createSurfConextProfile({
				id: SPECIAL_USER_ID,
			})
		})

		await client
			.login(SPECIAL_USER_ID)
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client
			.graphql({ query: `{me {id name email}}` })
			.then(({ data }) => expect(data.me).toEqual({
				id: SPECIAL_USER_ID,
				name: 'Step Wise',
				email: 'step@wise.com',
			}))
	})

	it('automatically creates account for unregistered users', async () => {
		const client = await createClient()

		await client
			.login('00000000-0000-0000-0000-111111111111')
			.then(redirectUrl => expect(redirectUrl).toEqual(defaultConfig.homepageUrl))

		await client.graphql({ query: `{me {name email}}` })
			.then(({ data }) => expect(data.me).toEqual({
				name: 'John Doe',
				email: 'john@example.org',
			}))
	})
})
