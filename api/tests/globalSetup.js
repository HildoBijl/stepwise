const { createSequelize, createUmzug } = require('../scripts')
const { clearDatabaseSchema } = require('./testutil')

module.exports = async function setupTestDatabase() {
	const sequelize = createSequelize(true)
	try {
		await sequelize.authenticate()
		await clearDatabaseSchema(sequelize)
		await createUmzug(sequelize).up()
	} finally {
		await sequelize.close()
	}
}
