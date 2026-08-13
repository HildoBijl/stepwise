// You can only run this when you have permissions to change the schema. In a shared production DB you might need to drop the database manually instead.
async function clearDatabaseSchema(sequelize) {
	await sequelize.query(`
		drop schema if exists public cascade;
		create schema public;
	`)
}

async function clearDatabaseData(sequelize) {
	const queryGenerator = sequelize.getQueryInterface().queryGenerator
	const tables = Object.values(sequelize.models).map(model => queryGenerator.quoteTable(model.getTableName()))
	if (tables.length > 0) await sequelize.query(`truncate table ${tables.join(', ')} restart identity cascade;`)
}

module.exports = {
	clearDatabaseData, clearDatabaseSchema
}
