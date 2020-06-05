const request = require('supertest')
const { createServer } = require('.')
const { DataSource } = require('apollo-datasource')

class MockDatabase extends DataSource {
	constructor() {
		super()
		this.Exercise = {
			findAll: () => Promise.resolve([{ id: 1, name: 'Mechanics' }, { id: 2, name: 'Biology' }])
		}
	}
}

const defaultConfig = Object.freeze({
	sslEnabled: false,
	sessionSecret: '12345678901234567890',
	sessionMaxAgeMillis: 1000 * 60,
	homepageUrl: undefined,
	corsUrls: undefined,
})

class Client {
	constructor() {
		this.server = request(createServer({
			database: new MockDatabase(),
			config: defaultConfig,
		}))
		this.cookies = []
	}

	async graphql(query) {
		const response = await this.server
			.post('/graphql')
			.set('Cookie', this.cookies.join(' '))
			.send(query)
			.expect(200)
		this.cookies = (response.headers['set-cookie'] || [])
			.map(c => c.substr(0, c.indexOf(' ')))
		return response.body
	}
}

module.exports = {
	Client, defaultConfig
}
