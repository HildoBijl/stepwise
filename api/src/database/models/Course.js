const { DataTypes } = require('sequelize')
const CourseSubscription = require('./CourseSubscription')

module.exports = (sequelize) => {
	const Course = sequelize.define('course', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		code: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		goals: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
		},
		startingPoints: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
		},
		setup: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	})

	Course.associate = models => {
		Course.belongsToMany(models.User, { as: 'participants', through: CourseSubscription(sequelize) })
		Course.hasMany(models.CourseBlock, { as: 'blocks' })
	}

	return Course
}
