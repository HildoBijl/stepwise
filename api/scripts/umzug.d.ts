declare module 'umzug' {
	export default class Umzug {
		constructor(options: any)
	}
}

declare module 'umzug/lib/storages/SequelizeStorage' {
	export default class SequelizeStorage {
		constructor(options: any)
		executed(): Promise<string[]>
		logMigration(name: string): Promise<unknown>
		unlogMigration(name: string): Promise<unknown>
	}
}
