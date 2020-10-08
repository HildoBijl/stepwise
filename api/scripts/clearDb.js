const { Database } = require('../src/database')
const { createSequelize } = require('./init')
const { clearDatabaseSchema } = require('../tests/testutil')

const sequelize = createSequelize()

sequelize.authenticate()
	.then(() => new Database(sequelize))
	.then(async () => {
		await clearDatabaseSchema(sequelize)
	})
	.catch(console.error)
