// You can only run this when you have permissions to
// change the schema. In a shared production DB you might
// need to drop the database manually instead.
export const clearDatabaseSchema = async (sequelize) => {
	await sequelize.query(`
		drop schema if exists public cascade;
		create schema public;
	`)
}
