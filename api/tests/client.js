const request = require('supertest')
const { createServer } = require('../src/server')
const { createSequelize } = require('../scripts/init')
const SurfConextMock = require('../src/server/surfConext/devmock')
const { Database } = require('../src/database')
const noop = () => {}

const defaultConfig = Object.freeze({
	sslEnabled: false,
	sessionSecret: '12345678901234567890',
	sessionMaxAgeMillis: 1000 * 60,
	homepageUrl: 'http://step-wise.test',
	corsUrls: undefined,
})

const sequelize = createSequelize()
const database = new Database(sequelize)

class Client {
	constructor() {
		this._server = createServer({
			database: database,
			config: defaultConfig,
			sessionStore: undefined,
			surfConextClient: new SurfConextMock.MockClient(),
		})
		this._cookies = {}
	}

	_storeCookies(response) {
		(response.headers['set-cookie'] || [])
			.map(cookie => cookie.substr(0, cookie.indexOf(';')))
			.forEach(token => {
				const [name, value] = token.split('=')
				this._cookies[name] = value
			})
	}

	_cookieHeader() {
		return Object.entries(this._cookies)
			.map(([name, value]) => `${name}=${value}`)
			.join(' ')
	}

	async login(surfConextSub) {
		const response = await request(this._server)
			.get(`/auth/surfconext/login`)
			.query({ sub: surfConextSub })
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async logout() {
		const response = await request(this._server)
			.get('/auth/logout')
			.set('Cookie', this._cookieHeader())
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async graphql(query) {
		const response = await request(this._server)
			.post('/graphql')
			.set('Cookie', this._cookieHeader())
			.send(query)
			.expect(200)
		this._storeCookies(response)
		return response.body
	}
}

const createClient = async (seedingProcedure = noop) => {
	await sequelize.query('DROP SCHEMA public CASCADE;')
	await sequelize.query('CREATE SCHEMA public;')
	await sequelize.sync({ force: true })
	await seedingProcedure(database)
	return new Client()
}

// Teardown Jest
afterAll(() => {
	sequelize.close()
})

module.exports = {
	createClient, defaultConfig
}
