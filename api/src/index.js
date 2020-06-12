require('dotenv').config()
const { Sequelize } = require('sequelize')
const { createServer } = require('./server')
const { Database } = require('./database')
const session = require('express-session')
const Redis = require('redis')
const RedisStore = require('connect-redis')(session)
const devlogin = require('./server/auth/devlogin')
const { SurfConext } = require('./server/auth/openid')

const sequelize = new Sequelize(
	process.env.POSTGRES_DB,
	process.env.POSTGRES_USER,
	process.env.POSTGRES_PASSWORD,
	{
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		dialect: 'postgres',
		dialectOptions: {
			ssl: !process.env.POSTGRES_SSLCERT ? false : {
				ca: process.env.POSTGRES_SSLCERT.replace(/\\n/g, '\n')
			},
		},
		logging: process.env.NODE_ENV === 'production' ? false : console.log,
})

const surfConext = new SurfConext(
	process.env.SURFCONEXT_ISSUER_URL,
	process.env.SURFCONEXT_REDIRECT_URL,
	process.env.SURFCONEXT_CLIENT_ID,
	process.env.SURFCONEXT_SECRET,
)

const sessionStore = process.env.REDIS_HOST ? new RedisStore({
	client: Redis.createClient({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	})}) : devlogin.createMemoryStore()

const config = {
	sslEnabled: process.env.NODE_ENV === 'production',
	sessionSecret: process.env.SESSION_SECRET,
	sessionMaxAgeMillis: (process.env.SESSION_MAXAGE_HOURS || 0)*60*60*1000,
	homepageUrl: process.env.HOMEPAGE_URL,
	corsUrls: process.env.CORS_URLS ? process.env.CORS_URLS.split(';') : undefined,
}

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(database => database.dangerouslySyncDatabaseSchema())
	.then(database => database.fillWithSampleData())
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
