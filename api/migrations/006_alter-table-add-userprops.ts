import { DataTypes, type QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.addColumn('users', 'role', {
		type: DataTypes.ENUM(...[
			'student',
			'teacher',
			'admin',
		]),
		defaultValue: 'student',
		allowNull: false,
	})
	await queryInterface.addColumn('users', 'givenName', {
		type: DataTypes.TEXT,
		allowNull: true,
	})
	await queryInterface.addColumn('users', 'familyName', {
		type: DataTypes.TEXT,
		allowNull: true,
	})
	await queryInterface.changeColumn('users', 'name', {
		type: DataTypes.TEXT,
		allowNull: true,
	})
	await queryInterface.changeColumn('users', 'email', {
		type: DataTypes.TEXT,
		allowNull: true,
	})
	await queryInterface.addColumn('surfConextProfiles', 'schacPersonalUniqueCode', {
		type: DataTypes.ARRAY(DataTypes.TEXT),
	})
	await queryInterface.addColumn('surfConextProfiles', 'locale', {
		type: DataTypes.TEXT,
	})
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.removeColumn('users', 'role')
	await queryInterface.removeColumn('users', 'givenName')
	await queryInterface.removeColumn('users', 'familyName')
	await queryInterface.changeColumn('users', 'name', {
		type: DataTypes.TEXT,
		allowNull: false,
	})
	await queryInterface.changeColumn('users', 'email', {
		type: DataTypes.TEXT,
		allowNull: false,
	})
	await queryInterface.removeColumn('surfConextProfiles', 'schacPersonalUniqueCode')
	await queryInterface.removeColumn('surfConextProfiles', 'locale')
	await queryInterface.sequelize.query('drop type enum_users_role;')
}
