declare module 'umzug' {
	export default class Umzug {
		constructor(options: object)
		pending(): Promise<{ file: string }[]>
		up(): Promise<unknown>
		down(): Promise<unknown>
	}
}

declare module 'umzug/lib/storages/SequelizeStorage.js' {
	import type { Sequelize } from 'sequelize'

	export default class SequelizeStorage {
		constructor(options: { sequelize: Sequelize })
		executed(): Promise<string[]>
		logMigration(name: string): Promise<unknown>
		unlogMigration(name: string): Promise<unknown>
	}
}
