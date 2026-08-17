import { RedisStore } from 'connect-redis'
import { createClient } from 'redis'

export async function createRedisStore(): Promise<RedisStore> {
	const client = createClient({
		socket: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
		},
	})
	client.on('error', error => console.error('Redis error:', error))
	await client.connect()
	return new RedisStore({ client })
}
