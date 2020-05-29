const { Client } = require('./testclient')

describe('Exercises', () => {
	it('fetches all exercises', async () => {
		await new Client()
			.graphql({ query: `{exercises {id,name}}` })
			.then(({ data }) => expect(data.exercises)
				.toEqual([{ id: 1, name: 'Mechanics' }, { id: 2, name: 'Biology' }]))
	})
})