const { DataTypes } = require('sequelize')
const GroupMembership = require('./GroupMembership')

module.exports = (sequelize) => {
	const Group = sequelize.define('group', {
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

	Group.associate = models => {
		Group.belongsToMany(models.User, { as: 'members', through: GroupMembership(sequelize) })
	}

	return Group
}
