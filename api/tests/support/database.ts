import type { Sequelize } from 'sequelize'

// You can only run this when you have permissions to change the schema. In a shared production DB you might need to drop the database manually instead.
export async function clearDatabaseSchema(sequelize: Sequelize): Promise<void> {
	await sequelize.query(`
		drop schema if exists public cascade;
		create schema public;
	`)
}

export async function clearDatabaseData(sequelize: Sequelize): Promise<void> {
	const queryGenerator = sequelize.getQueryInterface().queryGenerator as { quoteTable(table: unknown): string }
	const tables = Object.values(sequelize.models).map(model => queryGenerator.quoteTable(model.getTableName()))
	if (tables.length > 0) await sequelize.query(`truncate table ${tables.join(', ')} restart identity cascade;`)
}
