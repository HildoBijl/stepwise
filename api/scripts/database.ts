import 'dotenv/config'

import path from 'node:path'
import { Sequelize } from 'sequelize'
import Umzug from 'umzug'
import SequelizeStorage from 'umzug/lib/storages/SequelizeStorage'

interface MigrationStorage {
	executed(): Promise<string[]>
	logMigration(name: string): Promise<unknown>
	unlogMigration(name: string): Promise<unknown>
}

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
	const migrationExtension = path.extname(__filename)
	const sequelizeStorage: MigrationStorage = new SequelizeStorage({ sequelize })
	const storage = {
		executed: async () => (await sequelizeStorage.executed()).map(name => name.replace(/\.js$/, migrationExtension)),
		logMigration: (name: string) => sequelizeStorage.logMigration(name.replace(/\.ts$/, '.js')),
		unlogMigration: (name: string) => sequelizeStorage.unlogMigration(name.replace(/\.ts$/, '.js')),
	}
	return new Umzug({
		migrations: {
			path: path.join(__dirname, '../migrations'),
			params: [sequelize.getQueryInterface()],
			pattern: new RegExp(`^\\d+[\\w-]+\\${migrationExtension}$`),
		},
		storage,
	})
}
