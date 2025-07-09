const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('courseBlocks', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			goals: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			courseId: {
				type: DataTypes.UUID,
				references: {
					model: 'courses',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
			},
			order: {
				type: DataTypes.INTEGER,
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
		await queryInterface.addIndex('courseBlocks', {
			fields: ['courseId', 'order'],
			unique: true,
		})
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('courseBlocks')
	},
}
