const request = require('supertest')
const { createServer } = require('../src/server')
const devLogin = require('../src/server/authStrategies/devLogin')
const { createSequelize } = require('../scripts/init')
const { Database } = require('../src/database')
const noop = () => {}

const defaultConfig = Object.freeze({
	sslEnabled: false,
	sessionSecret: '12345678901234567890',
	sessionMaxAgeMillis: 1000 * 60,
	homepageUrl: undefined,
	corsUrls: undefined,
})

const AUTH_PATH = '_devlogin'

const sequelize = createSequelize()
const database = new Database(sequelize)

class Client {
	constructor() {
		this._server = createServer({
			database: database,
			config: defaultConfig,
			sessionStore: devLogin.createPrefilledMemoryStore(),
			authStrategies: {
				[AUTH_PATH]: devLogin.authStrategy
			}
		})
		this._cookies = new Set()
	}

	_storeCookies(response) {
		(response.headers['set-cookie'] || [])
			.map(cookie => cookie.substr(0, cookie.indexOf(' ')))
			.forEach(token => this._cookies.add(token))
	}

	_cookieHeader() {
		return Array.from(this._cookies).join(' ')
	}

	async login(id) {
		const response = await request(this._server)
			.get(`/auth/${AUTH_PATH}/login`)
			.query({ id })
			.expect(200)
		this._storeCookies(response)
	}

	async logout() {
		const response = await request(this._server)
			.get('/auth/logout')
			.set('Cookie', this._cookieHeader())
			.expect(302)
		this._storeCookies(response)
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
	await sequelize.drop()
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
