// You can only run this when you have permissions to
// change the schema. In a shared production DB you might
// need to drop the database manually instead.
const clearDatabaseSchema = async (sequelizeTemplateDb) => {
	await sequelizeTemplateDb.query(`
		drop schema if exists public cascade;
		create schema public;
	`)
}

module.exports = {
	clearDatabaseSchema
}
