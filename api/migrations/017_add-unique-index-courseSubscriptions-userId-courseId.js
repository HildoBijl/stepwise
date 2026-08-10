module.exports = {
	up: async (queryInterface) => {
		await queryInterface.addIndex('courseSubscriptions', {
			fields: ['userId', 'courseId'],
			name: 'courseSubscriptions_userId_courseId_unique',
			unique: true,
		})
		await queryInterface.removeIndex('courseSubscriptions', 'course_subscriptions_user_id')
	},

	down: async (queryInterface) => {
		await queryInterface.addIndex('courseSubscriptions', {
			fields: ['userId'],
			name: 'course_subscriptions_user_id',
		})
		await queryInterface.removeIndex('courseSubscriptions', 'courseSubscriptions_userId_courseId_unique')
	},
}
