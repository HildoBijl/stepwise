const { DataTypes } = require('sequelize')
const GroupMembership  = require('./GroupMembership')

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
		},
		givenName: {
			type: DataTypes.TEXT,
		},
		familyName: {
			type: DataTypes.TEXT,
		},
		email: {
			type: DataTypes.TEXT,
			unique: true,
			allowNull: false,
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
		language: {
			type: DataTypes.STRING(5),
		},
		privacyPolicyAcceptedVersion: {
			type: DataTypes.INTEGER,
			allowNull: true,
		},
		privacyPolicyAcceptedAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	})

	User.associate = models => {
		User.hasMany(models.UserSkill, { as: 'skills', onDelete: 'CASCADE' })
		User.hasMany(models.SurfConextProfile, { onDelete: 'CASCADE' })
		User.belongsToMany(models.Group, { as: 'groups', through: GroupMembership(sequelize) })
	}

	return User
}
