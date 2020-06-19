module.exports = (sequelize, DataTypes) => {
	const UniversityMembership = sequelize.define('universityMembership', {
		memberId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
	})

	UniversityMembership.associate = models => {
		UniversityMembership.belongsTo(models.User)
	}

	return UniversityMembership
}
