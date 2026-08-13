import 'dotenv/config'

import path from 'node:path'
import { Sequelize } from 'sequelize'

// Umzug 2 does not provide TypeScript declarations.
const Umzug = require('umzug')

export function createSequelize(admin = false): Sequelize {
	return new Sequelize(
		process.env.POSTGRES_DB as string,
		(admin ? process.env.POSTGRES_ADMIN_USER : process.env.POSTGRES_APP_USER) as string,
		(admin ? process.env.POSTGRES_ADMIN_PASSWORD : process.env.POSTGRES_APP_PASSWORD) as string,
		{
			host: process.env.POSTGRES_HOST,
			port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : undefined,
			dialect: 'postgres',
			dialectOptions: { ssl: !process.env.POSTGRES_SSLCERT ? false : { ca: process.env.POSTGRES_SSLCERT.replace(/\\n/g, '\n') } },
			logging: false,
		},
	)
}

export function createUmzug(sequelize: Sequelize): any {
	return new Umzug({
		migrations: { path: path.join(__dirname, '../migrations'), params: [sequelize.getQueryInterface()] },
		storage: 'sequelize',
		storageOptions: { sequelize },
	})
}
