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
		goalWeights: {
			type: DataTypes.ARRAY(DataTypes.INTEGER),
			allowNull: true,
		},
		startingPoints: {
			type: DataTypes.ARRAY(DataTypes.STRING),
			allowNull: false,
		},
		setup: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		organization: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'stepwise',
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
		Course.belongsToMany(models.User, { as: 'participants', through: CourseSubscription(sequelize), onDelete: 'CASCADE' })
		Course.belongsToMany(models.User, { as: 'students', through: { model: CourseSubscription(sequelize), scope: { role: 'student' } }, onDelete: 'CASCADE' })
		Course.belongsToMany(models.User, { as: 'teachers', through: { model: CourseSubscription(sequelize), scope: { role: 'teacher' } }, onDelete: 'CASCADE' })
		Course.hasMany(models.CourseBlock, { as: 'blocks', onDelete: 'CASCADE' })
	}

	return Course
}
