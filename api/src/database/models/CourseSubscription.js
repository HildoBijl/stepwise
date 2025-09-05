const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const CourseSubscription = sequelize.define('courseSubscription', {
		userId: {
			type: DataTypes.UUID,
			primaryKey: true,
		},
		courseId: {
			type: DataTypes.UUID,
			primaryKey: true,
		},
		role: {
			type: DataTypes.ENUM([
				'student',
				'teacher',
			]),
			defaultValue: 'student',
			allowNull: false,
		},
	})

	CourseSubscription.associate = (models) => {
		CourseSubscription.belongsTo(models.User, { onDelete: 'CASCADE', hooks: true })
		CourseSubscription.belongsTo(models.Course, { onDelete: 'CASCADE', hooks: true })
	}

	return CourseSubscription
}
