const { createTestClient } = require('apollo-server-testing')
const { server } = require('./server')

it('fetches all exercises', async () => {
	const { query } = createTestClient(server)
	const res = await query({ query: `{exercises}` })
	expect(res.data.exercises).toEqual(['Mechanics', 'Biology'])
})
