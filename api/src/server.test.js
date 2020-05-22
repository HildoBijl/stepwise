const { createTestClient } = require('apollo-server-testing')
const { createServer } = require('./server')
const { DataSource } = require('apollo-datasource')

class MockDatabase extends DataSource {
	constructor() {
		super()
	}
	async getAllExercises() {
		return Promise.resolve([{id: 1, name: 'Mechanics'}, {id: 2, name: 'Biology'}])
	}
}

it('fetches all exercises', async () => {
	const { query } = createTestClient(createServer(new MockDatabase()))
	const res = await query({ query: `{exercises {id,name}}` })
	console.log(res.data)
	expect(res.data.exercises).toEqual([{ id: 1, name: 'Mechanics' }, { id: 2, name: 'Biology' }])
})
