const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('groupExerciseSubmissions', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
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
			groupExerciseEventId: {
				type: DataTypes.UUID,
				references: {
					model: 'groupExerciseEvents',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
			},
			action: {
				type: DataTypes.JSON,
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
		await queryInterface.addIndex('groupExerciseSubmissions', {
			fields: ['userId', 'groupExerciseEventId'],
			unique: true,
		})
	},

	down: async (queryInterface) => {
		queryInterface.dropTable('groupExerciseSubmissions')
	},

}
