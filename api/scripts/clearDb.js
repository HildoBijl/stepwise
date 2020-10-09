const { Database } = require('../src/database')
const { createSequelize } = require('./init')
const { clearDatabaseSchema } = require('../tests/testutil')

const sequelize = createSequelize(true)

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(async () => {
		await clearDatabaseSchema(sequelize)
	})
	.then(async () => await sequelize.close())
	.catch(console.error)
