import session, { type Store } from 'express-session'
import Redis from 'redis'
import connectRedis from 'connect-redis'

const RedisStore = connectRedis(session)

export function createRedisStore(): Store {
	return new RedisStore({
		client: Redis.createClient({
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
		}),
	})
}
