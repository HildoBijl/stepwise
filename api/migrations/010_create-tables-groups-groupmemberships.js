const { DataTypes } = require('sequelize')

module.exports = {
	up: async (queryInterface) => {
		await queryInterface.createTable('groups', {
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
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		})
		await queryInterface.addIndex('groups', {
			fields: ['code'],
			unique: true,
		})

		await queryInterface.createTable('groupMemberships', {
			userId: {
				type: DataTypes.UUID,
				references: {
					model: 'users',
					key: 'id',
				},
				onUpdate: 'cascade',
				onDelete: 'cascade',
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
			active: {
				type: DataTypes.BOOLEAN,
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
		await queryInterface.addIndex('groupMemberships', {
			fields: ['userId'],
		})
		await queryInterface.addIndex('groupMemberships', {
			fields: ['groupId'],
		})
	},

	down: async (queryInterface) => {
		await queryInterface.dropTable('groupMemberships')
		await queryInterface.dropTable('groups')
	},

}
