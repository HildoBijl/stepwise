import 'dotenv/config'

import { PubSub } from 'graphql-subscriptions'

import { Database } from '../src/database'
import { createServer, loadConfig } from '../src/server'
import { SurfConext } from '../src/modules/authentication'

import { createGoogleClient, createSurfConext } from './authentication'
import { createSequelize } from './sequelize'
import { createRedisStore } from './sessions'

const config = loadConfig(process.env)
const surfConextClient = config.isProduction ? createSurfConext() : new SurfConext.MockClient()
const googleClient = createGoogleClient()
const sessionStore = config.isProduction ? createRedisStore() : SurfConext.createPrefilledMemoryStore()
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
			devAuthPortal: config.isDevelopment ? { path: SurfConext.directoryPath, directory: SurfConext.userDirectory } : null,
		})

		server.listen(config.port, () => {
			console.log(`Server listening on port ${config.port}`)
		})
	})
	.catch(console.error)
