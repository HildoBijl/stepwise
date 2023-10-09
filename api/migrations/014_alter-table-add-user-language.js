const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.addColumn('users', 'language', {
			type: DataTypes.STRING(5),
			allowNull: true,
		})
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('users', 'language')
	},
}
