const { DataTypes } = require('sequelize')

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
		// TODO Question: Shall we capture `createdBy` as meta-data?
		// TODO Question: Should groups have names/titles, to help students identify them more easily?
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
		Group.belongsToMany(models.User, { as: 'members', through: 'groupMemberships' })
	}

	return Group
}
