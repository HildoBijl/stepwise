import { createSequelize } from './sequelize.js'

const sequelize = createSequelize(true)

sequelize.authenticate()
	.then(() => clearDatabaseSchema())
	.then(async () => await sequelize.close())
	.catch(console.error)

async function clearDatabaseSchema(): Promise<void> {
	await sequelize.query(`
		drop schema if exists public cascade;
		create schema public;
	`)
}
