const request = require('supertest')

const SurfConextMock = require('../src/modules/authentication/surfConext/devmock')
const GoogleMock = require('../src/modules/authentication/google/devmock')
const { createServer } = require('../src/server')
const { Database } = require('../src/database')
const { createSequelize } = require('../scripts')

const { clearDatabaseData } = require('./testutil')

function noop() {
}

const defaultConfig = Object.freeze({
	sslEnabled: false,
	sessionSecret: '12345678901234567890',
	sessionMaxAgeMillis: 1000 * 60,
	apiDomain: 'api.step-wise.test',
	homepageUrl: 'http://step-wise.test',
	corsUrls: undefined,
})

const sequelize = createSequelize(true)
const database = new Database(sequelize)

class PubSubMock {
	constructor() {
		this.eventCount = {}
	}

	publish(eventId) {
		if (this.eventCount[eventId] === undefined) {
			this.eventCount[eventId] = 0
		}
		this.eventCount[eventId] += 1
	}

	reset() {
		this.eventCount = {}
	}
}

class Client {
	constructor(server, pubsub) {
		this._pubsub = pubsub
		this._server = server
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

	async initiate(redirect) {
		const response = await request(this._server)
			.get(`/auth/surfconext/initiate`)
			.query({ redirect })
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async loginSurfConext(surfConextSub) {
		const response = await request(this._server)
			.get(`/auth/surfconext/login`)
			.set('Cookie', [this._cookieHeader()])
			.query({ sub: surfConextSub })
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async loginGoogle(googleSub) {
		const response = await request(this._server)
			.post(`/auth/google/login`)
			.send(`credential=${googleSub}`)
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

	async graphql(query, expectedStatus = 200) {
		const response = await request(this._server)
			.post('/graphql')
			.set('Cookie', this._cookieHeader())
			.send(query)
			.expect(expectedStatus)
		this._storeCookies(response)
		return response.body
	}

	countEvents(eventId) {
		return this._pubsub.eventCount[eventId] || 0
	}
}

async function createClient(seedingProcedure = noop) {
	await clearDatabaseData(sequelize)
	await seedingProcedure(database)
	pubsub.reset()
	return new Client(server, pubsub)
}

const pubsub = new PubSubMock()
let server

beforeAll(async () => {
	await sequelize.authenticate()
	server = await createServer({
		database,
		config: defaultConfig,
		sessionStore: undefined,
		surfConextClient: new SurfConextMock.MockClient(),
		googleClient: new GoogleMock.MockClient(),
		pubsub,
	})
})

// Teardown Jest
afterAll(async () => {
	if (server) await server.stop()
	await sequelize.close()
})

module.exports = {
	createClient, defaultConfig
}
