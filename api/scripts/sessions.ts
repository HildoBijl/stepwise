import session, { type Store } from 'express-session'

// connect-redis 6 and redis 3 do not provide TypeScript declarations.
const Redis = require('redis')
const RedisStore = require('connect-redis')(session)

export function createRedisStore(): Store {
	return new RedisStore({
		client: Redis.createClient({
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
		}),
	})
}
