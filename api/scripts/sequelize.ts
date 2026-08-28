import 'dotenv/config'
import { Sequelize } from 'sequelize'

interface CreateSequelizeOptions {
	admin?: boolean
	database?: string
}

export function createSequelize({ admin = false, database = process.env.POSTGRES_DB as string }: CreateSequelizeOptions = {}): Sequelize {
	return new Sequelize(
		database,
		(admin ? process.env.POSTGRES_ADMIN_USER : process.env.POSTGRES_APP_USER) as string,
		(admin ? process.env.POSTGRES_ADMIN_PASSWORD : process.env.POSTGRES_APP_PASSWORD) as string,
		{
			...(process.env.POSTGRES_HOST ? { host: process.env.POSTGRES_HOST } : {}),
			...(process.env.POSTGRES_PORT ? { port: Number(process.env.POSTGRES_PORT) } : {}),
			dialect: 'postgres',
			dialectOptions: { ssl: !process.env.POSTGRES_SSLCERT ? false : { ca: process.env.POSTGRES_SSLCERT.replace(/\\n/g, '\n') } },
			logging: false,
		},
	)
}
