const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('userSkills', {
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
			skillId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			numPracticed: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
				allowNull: false,
			},
			coefficients: {
				type: DataTypes.ARRAY(DataTypes.DOUBLE),
				defaultValue: [1],
				allowNull: false,
			},
			coefficientsOn: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
				allowNull: false,
			},
			highest: {
				type: DataTypes.ARRAY(DataTypes.DOUBLE),
				defaultValue: [1],
				allowNull: false,
			},
			highestOn: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
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
		await queryInterface.addIndex('userSkills', {
			fields: ['userId', 'skillId'],
			unique: true,
		})
	},

	down: async (queryInterface) => {
		queryInterface.dropTable('userSkills')
	},

}
