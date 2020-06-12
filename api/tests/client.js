const request = require('supertest')
const { createServer } = require('../src/server')
const devlogin = require('../src/server/auth/devlogin')
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

const LOGIN_ROUTE = '/auth/_devlogin'

const sequelize = createSequelize()
const database = new Database(sequelize)

class Client {
	constructor() {
		this._server = createServer({
			database: database,
			config: defaultConfig,
			sessionStore: devlogin.createMemoryStore(),
		})
		this._server.use(LOGIN_ROUTE, devlogin.router)
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
			.get(LOGIN_ROUTE)
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
