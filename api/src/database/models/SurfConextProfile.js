const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const SurfConextProfile = sequelize.define('surfConextProfile', {
		id: {
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		schacHomeOrganization: {
			type: DataTypes.TEXT,
		}
	})

	SurfConextProfile.associate = models => {
		SurfConextProfile.belongsTo(models.User)
	}

	return SurfConextProfile
}
