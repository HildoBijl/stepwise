import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.renameColumn('exerciseSamples', 'state', 'parameters')
	await queryInterface.renameColumn('groupExerciseSamples', 'state', 'parameters')
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.renameColumn('groupExerciseSamples', 'parameters', 'state')
	await queryInterface.renameColumn('exerciseSamples', 'parameters', 'state')
}
