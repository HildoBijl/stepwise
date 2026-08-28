import { type Sequelize, QueryTypes } from 'sequelize'

export async function clearDatabaseSchema(sequelize: Sequelize): Promise<void> {
	await ensureTestingDatabase(sequelize)
	await sequelize.query(`
		drop schema if exists public cascade;
		create schema public;
	`)
}

export async function clearDatabaseData(sequelize: Sequelize): Promise<void> {
	await ensureTestingDatabase(sequelize)
	const queryGenerator = sequelize.getQueryInterface().queryGenerator as { quoteTable(table: unknown): string }
	const tables = Object.values(sequelize.models).map(model => queryGenerator.quoteTable(model.getTableName()))
	if (tables.length > 0) await sequelize.query(`truncate table ${tables.join(', ')} restart identity cascade;`)
}

async function ensureTestingDatabase(sequelize: Sequelize): Promise<void> {
	const rows = await sequelize.query<{ database: string }>('select current_database() as database;', { type: QueryTypes.SELECT })
	const database = rows[0]?.database
	if (database !== 'testing') throw new Error(`Refusing to clear database "${database ?? 'unknown'}": integration tests may only clear the "testing" database.`)
}
