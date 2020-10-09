const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('surfConextProfiles', {
			id: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
			},
			userId: {
				type: DataTypes.UUID,
				references: {
					model: 'users',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
			},
			schacHomeOrganization: {
				type: DataTypes.STRING,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		})
	},

	down: async (queryInterface) => {
		queryInterface.dropTable('surfConextProfiles')
	},

}
