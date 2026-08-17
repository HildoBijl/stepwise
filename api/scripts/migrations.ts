import path from 'node:path'
import type { QueryInterface, Sequelize } from 'sequelize'
import { SequelizeStorage, Umzug } from 'umzug'

interface UmzugOptions {
	logging?: boolean
}

export function createUmzug(sequelize: Sequelize, { logging = true }: UmzugOptions = {}): Umzug<QueryInterface> {
	const migrationExtension = path.extname(import.meta.filename)
	return new Umzug<QueryInterface>({
		context: sequelize.getQueryInterface(),
		storage: new SequelizeStorage({ sequelize }),
		migrations: {
			glob: [`[0-9]*${migrationExtension}`, { cwd: path.join(import.meta.dirname, '../migrations') }],
			resolve(parameters) {
				return {
					...Umzug.defaultResolver(parameters),
					name: parameters.name.replace(/\.ts$/, '.js'),
				}
			},
		},
		logger: logging ? console : undefined,
	})
}
