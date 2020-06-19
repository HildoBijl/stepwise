module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		}
	})

  User.associate = models => {
		User.hasMany(models.UserSkill, { onDelete: 'CASCADE' })
		User.hasMany(models.UniversityMembership, { onDelete: 'CASCADE' })
  }

  return User
}
