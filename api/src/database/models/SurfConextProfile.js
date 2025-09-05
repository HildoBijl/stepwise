const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const SurfConextProfile = sequelize.define('surfConextProfile', {
		id: {
			// Unbounded UTF-8 String of unknown format
			type: DataTypes.TEXT,
			allowNull: false,
			primaryKey: true,
		},
		schacHomeOrganization: {
			type: DataTypes.TEXT,
		},
		schacPersonalUniqueCode: {
			type: DataTypes.ARRAY(DataTypes.TEXT),
		},
		locale: {
			type: DataTypes.TEXT,
		},
	})

	SurfConextProfile.associate = models => {
		SurfConextProfile.belongsTo(models.User, { onDelete: 'CASCADE', hooks: true })
	}

	return SurfConextProfile
}
