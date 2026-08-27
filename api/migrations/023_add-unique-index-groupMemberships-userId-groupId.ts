import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('groupMemberships', {
		fields: ['userId', 'groupId'],
		name: 'groupMemberships_userId_groupId_unique',
		unique: true,
	})
	await queryInterface.removeIndex('groupMemberships', 'group_memberships_user_id')
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('groupMemberships', {
		fields: ['userId'],
		name: 'group_memberships_user_id',
	})
	await queryInterface.removeIndex('groupMemberships', 'groupMemberships_userId_groupId_unique')
}
