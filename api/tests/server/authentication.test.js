const { createClient, defaultConfig } = require('../client')
const { DIRECTORY_PATH } = require('../../src/server/surfConext/devmock')

const SPECIAL_USER_ID = '00000000-0000-0000-0000-000000000000'
const SPECIAL_USER_SURFSUB = '0000000000000000000000000000000000000000'

const seed = async db => {
	const user = await db.User.create({
		id: SPECIAL_USER_ID,
		name: 'Step Wise',
		email: 'step@wise.com'
	})
	await user.createSurfConextProfile({
		id: SPECIAL_USER_SURFSUB,
	})
}

describe('Authentication', () => {
	it('there is no active session without logging in', async () => {
		const client = await createClient(seed)

		await expect(
			client.graphql({ query: `{me {email}}` }).then(({ data }) => data.me)
		).resolves.toEqual(null)
	})

	it('establishes session after login and destroys it after logout', async () => {
		const client = await createClient(seed)

		await expect(
			client.login(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({ query: `{me {id name email}}` }).then(({ data }) => data.me)
		).resolves.toEqual({
			id: SPECIAL_USER_ID,
			name: 'Step Wise',
			email: 'step@wise.com',
		})

		await expect(
			client.logout()
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({ query: `{me {email}}` }).then(({ data }) => data.me)
		).resolves.toEqual(null)
	})

	it('doesn’t login users with invalid credentials', async () => {
		const client = await createClient(seed)

		// This id is not whitelisted in the SurfConext mock data, therefore the authentication will fail.
		const INVALID_DEV_LOGIN_ID = 'ffffffff-ffff-ffff-ffff-123456789012'

		await expect(
			client.login(INVALID_DEV_LOGIN_ID)
		).resolves.toEqual(
			expect.stringContaining('error=INVALID_AUTHENTICATION')
		)

		await expect(
			client.graphql({ query: `{me {email}}` }).then(({ data }) => data.me)
		).resolves.toEqual(null)
	})

	it('Updates the user information on every login', async () => {
		const client = await createClient(async db => {
			const user = await db.User.create({
				id: SPECIAL_USER_ID,
				name: 'Old Name',
				email: 'old@email.com'
			})
			await user.createSurfConextProfile({
				id: SPECIAL_USER_SURFSUB,
			})
		})

		await expect(
			client.login(SPECIAL_USER_SURFSUB)
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({ query: `{me {id name email}}` }).then(({ data }) => data.me)
		).resolves.toEqual({
			id: SPECIAL_USER_ID,
			name: 'Step Wise',
			email: 'step@wise.com',
		})
	})

	it('automatically creates account for unregistered users', async () => {
		const client = await createClient()

		await expect(
			client.login('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl)

		await expect(
			client.graphql({ query: `{me {name email}}` }).then(({ data }) => data.me)
		).resolves.toEqual({
			name: 'John Doe',
			email: 'john@example.org',
		})
	})

	it('redirects users after successful login', async () => {
		const client = await createClient()
		const customRedirectPath = '/my/custom/redirect/route'

		await expect(
			client.initiate(customRedirectPath)
		).resolves.toEqual(DIRECTORY_PATH)

		await expect(
			client.login('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl + customRedirectPath)
	})

	it('ignores redirect if it’s not a relative path', async () => {
		const client = await createClient()
		const evilRedirectPath = 'http://evil-site.com'

		await expect(
			client.initiate(evilRedirectPath)
		).resolves.toEqual(DIRECTORY_PATH)

		await expect(
			client.login('1111111111111111111111111111111111111111')
		).resolves.toEqual(defaultConfig.homepageUrl)
	})
})
