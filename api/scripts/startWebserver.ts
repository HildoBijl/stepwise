import 'dotenv/config'

import { PubSub } from 'graphql-subscriptions'

import { loadConfig } from '../src/config'
import { Database } from '../src/database'
import { createServer } from '../src/server'
import * as SurfConextMock from '../src/modules/authentication/surfConext/devmock'

import { createGoogleClient, createRedisStore, createSequelize, createSurfConext } from './init'

const config = loadConfig(process.env)
const surfConextClient = config.isProduction ? createSurfConext() : new SurfConextMock.MockClient()
const googleClient = createGoogleClient()
const sessionStore = config.isProduction ? createRedisStore() : SurfConextMock.createPrefilledMemoryStore()
const sequelize = createSequelize()

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(async database => {
		const server = await createServer({
			config: config.server,
			database,
			sessionStore,
			surfConextClient,
			googleClient,
			pubsub: new PubSub(),
			useI18n: config.isDevelopment,
			devAuthPortal: config.isDevelopment ? { path: SurfConextMock.DIRECTORY_PATH, directory: SurfConextMock.userDirectory } : null,
		})

		server.listen(config.port, () => {
			console.log(`Server listening on port ${config.port}`)
		})
	})
	.catch(console.error)
