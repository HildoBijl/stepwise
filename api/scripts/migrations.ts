import path from 'node:path'
import type { Sequelize } from 'sequelize'
import Umzug from 'umzug'
import SequelizeStorageImport from 'umzug/lib/storages/SequelizeStorage.js'

interface MigrationStorage {
	executed(): Promise<string[]>
	logMigration(name: string): Promise<unknown>
	unlogMigration(name: string): Promise<unknown>
}

const sequelizeStorageImport = SequelizeStorageImport as unknown as { default?: typeof SequelizeStorageImport }
const SequelizeStorage = sequelizeStorageImport.default ?? SequelizeStorageImport

export function createUmzug(sequelize: Sequelize): any {
	const migrationExtension = path.extname(import.meta.filename)
	const sequelizeStorage: MigrationStorage = new SequelizeStorage({ sequelize })
	const storage = {
		executed: async () => (await sequelizeStorage.executed()).map(name => name.replace(/\.js$/, migrationExtension)),
		logMigration: (name: string) => sequelizeStorage.logMigration(name.replace(/\.ts$/, '.js')),
		unlogMigration: (name: string) => sequelizeStorage.unlogMigration(name.replace(/\.ts$/, '.js')),
	}
	return new Umzug({
		migrations: {
			path: path.join(import.meta.dirname, '../migrations'),
			params: [sequelize.getQueryInterface()],
			pattern: new RegExp(`^\\d+[\\w-]+\\${migrationExtension}$`),
		},
		storage,
	})
}
