module.exports = (sequelize, DataTypes) => {
	const SurfConextProfile = sequelize.define('surfConextProfile', {
		sub: {
			type: DataTypes.UUID,
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
