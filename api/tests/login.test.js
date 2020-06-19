const { createClient } = require('./client')

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

describe('me', () => {
	it('returns `null` for non-logged-in user', async () => {
		const client = await createClient(seed)

		await client.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('returns user information after login', async () => {
		const client = await createClient(seed)

		await client.login(USER_ID)
		await client
			.graphql({ query: `{me {name}}` })
			.then(({ data }) => expect(data.me).toEqual({ name: 'Tester' }))

		await client.logout()
		await client.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})
})
