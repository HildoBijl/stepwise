const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
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
		User.hasMany(models.UserSkill, { as: 'skills', onDelete: 'CASCADE' })
		User.hasMany(models.SurfConextProfile, { onDelete: 'CASCADE' })
  }

  return User
}
