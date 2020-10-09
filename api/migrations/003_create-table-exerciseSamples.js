const { DataTypes } = require('sequelize')

module.exports = {
	up: async (sequelize) => {
		await sequelize.createTable('exerciseSamples', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			userSkillId: {
				type: DataTypes.UUID,
				references: {
					model: 'userSkills',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
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

	down: async (sequelize) => {
		sequelize.dropTable('exerciseSamples')
	},

}
