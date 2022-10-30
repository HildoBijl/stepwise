const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('groupExerciseEvents', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			groupExerciseSampleId: {
				type: DataTypes.UUID,
				references: {
					model: 'groupExerciseSamples',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
			},
			progress: {
				type: DataTypes.JSON,
				allowNull: true,
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
		queryInterface.dropTable('groupExerciseEvents')
	},

}
