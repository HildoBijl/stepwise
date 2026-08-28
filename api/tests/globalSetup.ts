import { createUmzug } from '../scripts/migrations.ts'
import { createSequelize } from '../scripts/sequelize.ts'

import { clearDatabaseSchema } from './support/database.ts'

export default async function setupTestDatabase(): Promise<void> {
	const sequelize = createSequelize({ admin: true, database: 'testing' })
	try {
		await sequelize.authenticate()
		await clearDatabaseSchema(sequelize)
		await createUmzug(sequelize, { logging: false }).up()
	} finally {
		await sequelize.close()
	}
}
