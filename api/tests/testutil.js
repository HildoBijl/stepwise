const clearDatabaseSchema = async (sequelize) => {
	const schema = await(async () => {
		const [result] = await sequelize.query('SELECT current_schema();')
		return result[0].current_schema
	})()
	await sequelize.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE;`)
	await sequelize.query(`CREATE SCHEMA ${schema};`)
}

module.exports = {
	clearDatabaseSchema
}
