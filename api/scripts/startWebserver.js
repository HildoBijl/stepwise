require('dotenv').config()
const { createServer } = require('../src/server')
const { Database } = require('../src/database')
const devlogin = require('../src/server/auth/devlogin')
const { createRedisStore, createSurfConext, createSequelize } = require('./init')

const surfConext = createSurfConext()

const sessionStore = process.env.REDIS_HOST ?
	createRedisStore() : devlogin.createMemoryStore()

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
			surfConext,
		})
		if (process.env.NODE_ENV === 'development') {
			server.use('/auth/_devlogin', devlogin.router)
		}
		server.listen(process.env.PORT, () => {
			console.log(`Server listening on port ${process.env.PORT}`)
		})
	})