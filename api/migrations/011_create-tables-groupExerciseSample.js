const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('groupExerciseSamples', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			groupId: {
				type: DataTypes.UUID,
				references: {
					model: 'groups',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
			},
			skillId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			exerciseId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			state: {
				type: DataTypes.JSON,
				allowNull: false,
			},
			active: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
				allowNull: false,
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
		queryInterface.dropTable('groupExerciseSamples')
	},

}
