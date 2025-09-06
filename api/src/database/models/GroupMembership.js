const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const GroupMembership = sequelize.define('groupMembership', {
		userId: {
			type: DataTypes.UUID,
			primaryKey: true,
		},
		groupId: {
			type: DataTypes.UUID,
			primaryKey: true,
		},
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	})

	GroupMembership.associate = (models) => {
		GroupMembership.belongsTo(models.User, { onDelete: 'CASCADE' })
		GroupMembership.belongsTo(models.Group, { onDelete: 'CASCADE' })
	}

	return GroupMembership
}
