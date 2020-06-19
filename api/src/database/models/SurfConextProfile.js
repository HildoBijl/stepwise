module.exports = (sequelize, DataTypes) => {
	const SurfConextProfile = sequelize.define('surfConextProfile', {
		sub: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
	})

	SurfConextProfile.associate = models => {
		SurfConextProfile.belongsTo(models.User)
	}

	return SurfConextProfile
}
