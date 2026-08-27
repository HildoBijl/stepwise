import 'dotenv/config'
import { PubSub } from 'graphql-subscriptions'

import { SurfConext } from '../src/modules/authentication/index.ts'
import { Database } from '../src/database.ts'
import { createServer, loadConfig } from '../src/server/index.ts'

import { createGoogleClient, createSurfConext } from './authentication.ts'
import { createSequelize } from './sequelize.ts'
import { createRedisStore } from './sessions.ts'

const config = loadConfig(process.env)
const surfConextClient = config.isProduction ? createSurfConext() : new SurfConext.MockClient()
const googleClient = createGoogleClient()
const sequelize = createSequelize()

async function startWebserver(): Promise<void> {
	const sessionStore = config.isProduction ? await createRedisStore() : SurfConext.createPrefilledMemoryStore()
	await sequelize.authenticate()
	const database = new Database(sequelize)
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

	server.listen(config.port, () => console.log(`Server listening on port ${config.port}`))
}

startWebserver().catch(console.error)
