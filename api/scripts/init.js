require('dotenv').config()
const { Sequelize } = require('sequelize')
const SurfConext = require('../src/server/surfConext/client')
const session = require('express-session')
const Redis = require('redis')
const RedisStore = require('connect-redis')(session)

module.exports.createSequelize = () => new Sequelize(
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
		logging: false,
	}
)

module.exports.createSurfConext = () => new SurfConext.Client(
	process.env.SURFCONEXT_ISSUER_URL,
	process.env.SURFCONEXT_REDIRECT_URL,
	process.env.SURFCONEXT_CLIENT_ID,
	process.env.SURFCONEXT_SECRET,
)

module.exports.createRedisStore = () => new RedisStore({
	client: Redis.createClient({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	})
})
