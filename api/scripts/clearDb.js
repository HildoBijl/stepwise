import { Database } from '../src/database'
import { createSequelize } from './init'
import { clearDatabaseSchema } from '../tests/testutil'

const sequelize = createSequelize(true)

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(async () => {
		await clearDatabaseSchema(sequelize)
	})
	.then(async () => await sequelize.close())
	.catch(console.error)
