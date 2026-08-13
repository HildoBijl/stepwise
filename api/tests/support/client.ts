import request, { type Response } from 'supertest'
import type { PubSubEngine } from 'graphql-subscriptions'

import { Google, SurfConext } from '../../src/modules/authentication'
import { createServer, type ApiServer, type ServerConfig } from '../../src/server'
import { Database } from '../../src/database'
import { createSequelize } from '../../scripts'

import { clearDatabaseData } from './database'

export const defaultConfig: ServerConfig = Object.freeze({
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
	eventCount: Record<string, number> = {}

	async publish(eventId: string): Promise<void> {
		if (this.eventCount[eventId] === undefined) {
			this.eventCount[eventId] = 0
		}
		this.eventCount[eventId] += 1
	}

	reset(): void {
		this.eventCount = {}
	}
}

class Client {
	private readonly _pubsub: PubSubMock
	private readonly _server: ApiServer
	private readonly _cookies: Record<string, string> = {}

	constructor(server: ApiServer, pubsub: PubSubMock) {
		this._pubsub = pubsub
		this._server = server
	}

	private _storeCookies(response: Response): void {
		([response.headers['set-cookie'] || []].flat() as string[])
			.map((cookie: string) => cookie.substring(0, cookie.indexOf(';')))
			.forEach(token => {
				const [name, value] = token.split('=')
				this._cookies[name] = value
			})
	}

	private _cookieHeader(): string {
		return Object.entries(this._cookies)
			.map(([name, value]) => `${name}=${value}`)
			.join(' ')
	}

	async initiate(redirect?: string): Promise<string> {
		const response = await request(this._server)
			.get(`/auth/surfconext/initiate`)
			.query({ redirect })
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async loginSurfConext(surfConextSub: string): Promise<string> {
		const response = await request(this._server)
			.get(`/auth/surfconext/login`)
			.set('Cookie', [this._cookieHeader()])
			.query({ sub: surfConextSub })
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async loginGoogle(googleSub: string): Promise<string> {
		const response = await request(this._server)
			.post(`/auth/google/login`)
			.send(`credential=${googleSub}`)
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async logout(): Promise<string> {
		const response = await request(this._server)
			.get('/auth/logout')
			.set('Cookie', this._cookieHeader())
			.expect(302)
		this._storeCookies(response)
		return response.headers['location']
	}

	async graphql(query: Record<string, unknown>, expectedStatus = 200): Promise<any> {
		const response = await request(this._server)
			.post('/graphql')
			.set('Cookie', this._cookieHeader())
			.send(query)
			.expect(expectedStatus)
		this._storeCookies(response)
		return response.body
	}

	countEvents(eventId: string): number {
		return this._pubsub.eventCount[eventId] || 0
	}
}

export async function createClient(seedingProcedure: (database: Database) => Promise<void> = async () => {}): Promise<Client> {
	await clearDatabaseData(sequelize)
	await seedingProcedure(database)
	pubsub.reset()
	if (!server) throw new Error('Cannot create a test client before the API server has started.')
	return new Client(server, pubsub)
}

const pubsub = new PubSubMock() as PubSubMock & PubSubEngine
let server: ApiServer | undefined

beforeAll(async () => {
	await sequelize.authenticate()
	server = await createServer({
		database,
		config: defaultConfig,
		sessionStore: undefined,
		surfConextClient: new SurfConext.MockClient(),
		googleClient: new Google.MockClient(),
		pubsub,
	})
})

// Teardown Jest
afterAll(async () => {
	if (server) await server.stop()
	await sequelize.close()
})
