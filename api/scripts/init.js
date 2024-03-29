require('dotenv').config()
const { Sequelize } = require('sequelize')
const SurfConext = require('../src/server/surfConext/client')
const Google = require('../src/server/google/client')
const session = require('express-session')
const Redis = require('redis')
const RedisStore = require('connect-redis')(session)
const path = require('path')
const Umzug = require('umzug')

module.exports.createSequelize = (admin = false) => new Sequelize(
	process.env.POSTGRES_DB,
	admin ? process.env.POSTGRES_ADMIN_USER : process.env.POSTGRES_APP_USER,
	admin ? process.env.POSTGRES_ADMIN_PASSWORD : process.env.POSTGRES_APP_PASSWORD,
	{
		host: process.env.POSTGRES_HOST,
		port: process.env.POSTGRES_PORT,
		dialect: 'postgres',
		dialectOptions: {
			ssl: !process.env.POSTGRES_SSLCERT ? false : {
				ca: process.env.POSTGRES_SSLCERT.replace(/\\n/g, '\n')
			},
		},
		logging: false,
	}
)

module.exports.createSurfConext = () => new SurfConext.Client(
	process.env.SURFCONEXT_ISSUER_URL,
	process.env.SURFCONEXT_REDIRECT_URL,
	process.env.SURFCONEXT_CLIENT_ID,
	process.env.SURFCONEXT_SECRET,
)

module.exports.createGoogleClient = () => new Google.Client(process.env.GOOGLE_CLIENT_ID)

module.exports.createRedisStore = () => new RedisStore({
	client: Redis.createClient({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	})
})

module.exports.createUmzug = (sequelize) => new Umzug({
	migrations: {
		path: path.join(__dirname, '../migrations'),
		params: [
			sequelize.getQueryInterface()
		]
	},
	storage: 'sequelize',
	storageOptions: {
		sequelize: sequelize
	}
})
