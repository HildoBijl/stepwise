const { Client } = require('./testclient')

describe('me', () => {
	it('returns null on unknown user', async () => {
		await new Client()
			.graphql({ query: `{me {name, email}}` })
			.then(({ data }) => expect(data.me)
				.toEqual(null))
	})
})
