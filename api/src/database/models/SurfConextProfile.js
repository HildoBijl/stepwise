module.exports = (sequelize, DataTypes) => {
	const SurfConextProfile = sequelize.define('surfConextProfile', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		schacHomeOrganization: {
			type: DataTypes.STRING,
		}
	})

	SurfConextProfile.associate = models => {
		SurfConextProfile.belongsTo(models.User)
	}

	return SurfConextProfile
}
