import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.renameColumn('exerciseEvents', 'progress', 'state')
	await queryInterface.renameColumn('groupExerciseEvents', 'progress', 'state')
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.renameColumn('groupExerciseEvents', 'state', 'progress')
	await queryInterface.renameColumn('exerciseEvents', 'state', 'progress')
}
