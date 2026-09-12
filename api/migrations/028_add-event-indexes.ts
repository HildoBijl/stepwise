import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

const exerciseEventIndex = 'exerciseEvents_exerciseSampleId_eventIndex_unique'
const exerciseSampleIndex = 'exerciseEvents_exerciseSampleId'
const groupExerciseEventIndex = 'groupExerciseEvents_groupExerciseSampleId_eventIndex_unique'
const groupExerciseSampleIndex = 'groupExerciseEvents_groupExerciseSampleId'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addColumn('exerciseEvents', 'eventIndex', { type: DataTypes.INTEGER, allowNull: true })
	await queryInterface.sequelize.query(`
		WITH indexed_events AS (
			SELECT id, (ROW_NUMBER() OVER (PARTITION BY "exerciseSampleId" ORDER BY "createdAt", id) - 1)::INTEGER AS "eventIndex"
			FROM "exerciseEvents"
		)
		UPDATE "exerciseEvents"
		SET "eventIndex" = indexed_events."eventIndex"
		FROM indexed_events
		WHERE "exerciseEvents".id = indexed_events.id
	`)
	await queryInterface.changeColumn('exerciseEvents', 'eventIndex', { type: DataTypes.INTEGER, allowNull: false })
	await queryInterface.addIndex('exerciseEvents', {
		fields: ['exerciseSampleId', 'eventIndex'],
		name: exerciseEventIndex,
		unique: true,
	})
	await queryInterface.removeIndex('exerciseEvents', exerciseSampleIndex)

	await queryInterface.addColumn('groupExerciseEvents', 'eventIndex', { type: DataTypes.INTEGER, allowNull: true })
	await queryInterface.sequelize.query(`
		WITH indexed_events AS (
			SELECT id, (ROW_NUMBER() OVER (PARTITION BY "groupExerciseSampleId" ORDER BY "createdAt", id) - 1)::INTEGER AS "eventIndex"
			FROM "groupExerciseEvents"
		)
		UPDATE "groupExerciseEvents"
		SET "eventIndex" = indexed_events."eventIndex"
		FROM indexed_events
		WHERE "groupExerciseEvents".id = indexed_events.id
	`)
	await queryInterface.changeColumn('groupExerciseEvents', 'eventIndex', { type: DataTypes.INTEGER, allowNull: false })
	await queryInterface.addIndex('groupExerciseEvents', {
		fields: ['groupExerciseSampleId', 'eventIndex'],
		name: groupExerciseEventIndex,
		unique: true,
	})
	await queryInterface.removeIndex('groupExerciseEvents', groupExerciseSampleIndex)
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addIndex('groupExerciseEvents', {
		fields: ['groupExerciseSampleId'],
		name: groupExerciseSampleIndex,
	})
	await queryInterface.removeIndex('groupExerciseEvents', groupExerciseEventIndex)
	await queryInterface.removeColumn('groupExerciseEvents', 'eventIndex')

	await queryInterface.addIndex('exerciseEvents', {
		fields: ['exerciseSampleId'],
		name: exerciseSampleIndex,
	})
	await queryInterface.removeIndex('exerciseEvents', exerciseEventIndex)
	await queryInterface.removeColumn('exerciseEvents', 'eventIndex')
}
