import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('courseSubscriptions', {
		fields: ['userId', 'courseId'],
		name: 'courseSubscriptions_userId_courseId_unique',
		unique: true,
	})
	await queryInterface.removeIndex('courseSubscriptions', 'course_subscriptions_user_id')
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('courseSubscriptions', {
		fields: ['userId'],
		name: 'course_subscriptions_user_id',
	})
	await queryInterface.removeIndex('courseSubscriptions', 'courseSubscriptions_userId_courseId_unique')
}
