const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('courses', {
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false,
				primaryKey: true,
			},
			code: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			goals: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			startingPoints: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: false,
			},
			setup: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			organization: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'stepwise',
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
		await queryInterface.addIndex('courses', {
			fields: ['code'],
			unique: true,
		})

		await queryInterface.createTable('courseSubscriptions', {
			userId: {
				type: DataTypes.UUID,
				references: {
					model: 'users',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
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
			role: {
				type: DataTypes.ENUM([
					'student',
					'teacher',
				]),
				defaultValue: 'student',
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
		await queryInterface.addIndex('courseSubscriptions', {
			fields: ['userId'],
		})
		await queryInterface.addIndex('courseSubscriptions', {
			fields: ['courseId'],
		})
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('courseSubscriptions')
		await queryInterface.dropTable('courses')
	},
}
