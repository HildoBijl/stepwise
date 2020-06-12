const { createClient } = require('./client')

describe('me', () => {
	it('returns `null` on unknown user', async () => {
		const client = await createClient()

		await client.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))
	})

	it('returns user information after login', async () => {
		const client = await createClient(async db => {
			await db.User.create({
				id: '00000000-0000-0000-0000-000000000000',
				name: 'Tester',
				email: 'step@wise.com'
			})
		})

		await client.login('00000000-0000-0000-0000-000000000000')
		await client
			.graphql({ query: `{me {name}}` })
			.then(({ data }) => expect(data.me).toEqual({ name: 'Tester' }))

		await client.logout()
		await client.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me).toEqual(null))

	})
})
