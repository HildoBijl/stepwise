const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
	const CourseSubscription = sequelize.define('courseSubscription', {
		role: {
			type: DataTypes.ENUM([
				'student',
				'teacher',
			]),
			defaultValue: 'student',
			allowNull: false,
		},
	})

	return CourseSubscription
}
