const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const GroupMembership = sequelize.define('groupMembership', {
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		}
	})

	return GroupMembership
}
