import { Database } from '../../src/database.ts'
import { createSequelize } from '../../scripts/index.ts'

import { clearDatabaseData } from './database.ts'

const sequelize = createSequelize({ admin: true, database: 'testing' })

export const integrationDatabase = new Database(sequelize)

beforeAll(async () => {
	await sequelize.authenticate()
})

beforeEach(async () => {
	await clearDatabaseData(sequelize)
})

afterAll(async () => {
	await sequelize.close()
})
