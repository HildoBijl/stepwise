import { createSequelize, createUmzug } from '../scripts/index.js'
import { clearDatabaseSchema } from './support/database.js'

export default async function setupTestDatabase(): Promise<void> {
	const sequelize = createSequelize(true)
	try {
		await sequelize.authenticate()
		await clearDatabaseSchema(sequelize)
		await createUmzug(sequelize).up()
	} finally {
		await sequelize.close()
	}
}
