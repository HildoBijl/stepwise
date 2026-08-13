import { createSequelize, createUmzug } from '../scripts'
import { clearDatabaseSchema } from './support/database'

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
