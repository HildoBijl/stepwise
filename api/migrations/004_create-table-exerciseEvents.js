import { DataTypes } from 'sequelize'

export default {
	up: async (queryInterface) => {
		await queryInterface.createTable('exerciseEvents', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			action: {
				type: DataTypes.JSON,
				allowNull: false,
			},
			progress: {
				type: DataTypes.JSON,
				allowNull: false,
			},
			exerciseSampleId: {
				type: DataTypes.UUID,
				references: {
					model: 'exerciseSamples',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
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
		queryInterface.dropTable('exerciseEvents')
	},

}
