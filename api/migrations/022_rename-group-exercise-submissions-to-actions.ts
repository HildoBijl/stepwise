import type { MigrationParameters } from './types.ts'

const oldTableName = 'groupExerciseSubmissions'
const newTableName = 'groupExerciseActions'
const oldUniqueIndexName = 'group_exercise_submissions_user_id_group_exercise_event_id'
const newUniqueIndexName = 'group_exercise_actions_user_id_group_exercise_event_id'
const oldEventIndexName = 'groupExerciseSubmissions_groupExerciseEventId'
const newEventIndexName = 'groupExerciseActions_groupExerciseEventId'

async function renameIndex(queryInterface: MigrationParameters['context'], oldName: string, newName: string): Promise<void> {
	await queryInterface.sequelize.query(`ALTER INDEX "${oldName}" RENAME TO "${newName}"`)
}

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.renameTable(oldTableName, newTableName)
	await renameIndex(queryInterface, oldUniqueIndexName, newUniqueIndexName)
	await renameIndex(queryInterface, oldEventIndexName, newEventIndexName)
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await renameIndex(queryInterface, newEventIndexName, oldEventIndexName)
	await renameIndex(queryInterface, newUniqueIndexName, oldUniqueIndexName)
	await queryInterface.renameTable(newTableName, oldTableName)
}
