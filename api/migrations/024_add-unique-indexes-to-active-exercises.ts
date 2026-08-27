import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('exerciseSamples', {
		fields: ['userSkillId'],
		name: 'exerciseSamples_userSkillId_active_unique',
		unique: true,
		where: { active: true },
	})
	await queryInterface.addIndex('groupExerciseSamples', {
		fields: ['groupId', 'skillId'],
		name: 'groupExerciseSamples_groupId_skillId_active_unique',
		unique: true,
		where: { active: true },
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeIndex('groupExerciseSamples', 'groupExerciseSamples_groupId_skillId_active_unique')
	await queryInterface.removeIndex('exerciseSamples', 'exerciseSamples_userSkillId_active_unique')
}
