import { createSequelize } from './sequelize.ts'

const sequelize = createSequelize({ admin: true })

try {
	await sequelize.authenticate()
	await clearDatabaseSchema()
} catch (error) {
	console.error(error)
	process.exitCode = 1
} finally {
	await sequelize.close()
}

async function clearDatabaseSchema(): Promise<void> {
	await sequelize.query(`
		drop schema if exists public cascade;
		create schema public;
	`)
}
