const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.addColumn('users', 'role', {
			type: DataTypes.ENUM([
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
	},

	down: async (queryInterface) => {
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
	},
}
