import dotenv from 'dotenv'
dotenv.config()

import { Sequelize } from 'sequelize'
import SurfConextClient from '../src/server/surfConext/client'
import GoogleClient from '../src/server/google/client'
import session from 'express-session'
import Redis from 'redis'
import expressRedis from 'connect-redis'
import path from 'path'
import Umzug from 'umzug'

const RedisStore = expressRedis(session)

export const createSequelize = (admin = false) => new Sequelize(
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

export const createSurfConext = () => new SurfConextClient(
	process.env.SURFCONEXT_ISSUER_URL,
	process.env.SURFCONEXT_REDIRECT_URL,
	process.env.SURFCONEXT_CLIENT_ID,
	process.env.SURFCONEXT_SECRET,
)

export const createGoogleClient = () => new GoogleClient(process.env.GOOGLE_CLIENT_ID)

export const createRedisStore = () => new RedisStore({
	client: Redis.createClient({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	})
})

export const createUmzug = (sequelize) => new Umzug({
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
