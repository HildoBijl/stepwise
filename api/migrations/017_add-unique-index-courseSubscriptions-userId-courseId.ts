import type { QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.addIndex('courseSubscriptions', {
		fields: ['userId', 'courseId'],
		name: 'courseSubscriptions_userId_courseId_unique',
		unique: true,
	})
	await queryInterface.removeIndex('courseSubscriptions', 'course_subscriptions_user_id')
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.addIndex('courseSubscriptions', {
		fields: ['userId'],
		name: 'course_subscriptions_user_id',
	})
	await queryInterface.removeIndex('courseSubscriptions', 'courseSubscriptions_userId_courseId_unique')
}
