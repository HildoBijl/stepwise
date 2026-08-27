import { RedisStore } from 'connect-redis'
import { createClient } from 'redis'

export async function createRedisStore(): Promise<RedisStore> {
	const client = createClient({
		socket: {
			...(process.env.REDIS_HOST ? { host: process.env.REDIS_HOST } : {}),
			...(process.env.REDIS_PORT ? { port: Number(process.env.REDIS_PORT) } : {}),
		},
	})
	client.on('error', error => console.error('Redis error:', error))
	await client.connect()
	return new RedisStore({ client })
}
