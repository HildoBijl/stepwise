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
			// This is the full name, potentially including
			// the academic title
			type: DataTypes.TEXT,
			allowNull: true,
		},
		givenName: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		familyName: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		email: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		role: {
			type: DataTypes.ENUM([
				'student',
				'teacher',
				'admin',
			]),
			defaultValue: 'student',
			allowNull: false,
		},
	})

  User.associate = models => {
		User.hasMany(models.UserSkill, { as: 'skills', onDelete: 'CASCADE' })
		User.hasMany(models.SurfConextProfile, { onDelete: 'CASCADE' })
  }

  return User
}
