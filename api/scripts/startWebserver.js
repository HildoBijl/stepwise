require('dotenv').config()
const { createServer } = require('../src/server')
const { Database } = require('../src/database')
const devLogin = require('../src/server/authStrategies/devLogin')
const { createRedisStore, createSurfConext, createSequelize } = require('./init')

const surfConext = createSurfConext()

const sessionStore = process.env.REDIS_HOST ?
	createRedisStore() : devLogin.createPrefilledMemoryStore()

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
		const authStrategies = {
			// TODO add SurfConext
		}
		if (process.env.NODE_ENV !== 'production') {
			authStrategies['_devlogin'] = devLogin.authStrategy
		}

		const server = createServer({
			config,
			database,
			sessionStore,
			authStrategies
		})
		server.listen(process.env.PORT, () => {
			console.log(`Server listening on port ${process.env.PORT}`)
		})
	})
