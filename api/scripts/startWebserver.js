require('dotenv').config()
const { createServer } = require('../src/server')
const { Database } = require('../src/database')
const { createRedisStore, createSurfConext, createSequelize, createGoogleClient } = require('./init')
const SurfConextMock = require('../src/server/surfConext/devmock')

const surfConextClient = process.env.NODE_ENV === 'production' ?
	createSurfConext() : new SurfConextMock.MockClient()

const googleClient = createGoogleClient()

const sessionStore = process.env.NODE_ENV === 'production' ?
	createRedisStore() : SurfConextMock.createPrefilledMemoryStore()

const config = {
	sslEnabled: process.env.NODE_ENV === 'production',
	sessionSecret: process.env.SESSION_SECRET,
	sessionMaxAgeMillis: (process.env.SESSION_MAXAGE_HOURS || 0)*60*60*1000,
	homepageUrl: process.env.HOMEPAGE_URL,
	corsUrls: process.env.CORS_URLS ? process.env.CORS_URLS.split(';') : undefined,
}

const sequelize = createSequelize()

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(database => {
		const server = createServer({
			config,
			database,
			sessionStore,
			surfConextClient,
			googleClient,
		})

		if (process.env.NODE_ENV === 'development') {
			server.get(SurfConextMock.DIRECTORY_PATH, SurfConextMock.userDirectory)
		}

		server.listen(process.env.PORT, () => {
			console.log(`Server listening on port ${process.env.PORT}`)
		})
	})
