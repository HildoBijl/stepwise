import { QueryTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

const foreignKeys = [
	{ table: 'userSkills', column: 'userId' },
	{ table: 'surfConextProfiles', column: 'userId' },
	{ table: 'exerciseSamples', column: 'userSkillId' },
	{ table: 'exerciseEvents', column: 'exerciseSampleId' },
	{ table: 'groupExerciseSamples', column: 'groupId' },
	{ table: 'groupExerciseEvents', column: 'groupExerciseSampleId' },
	{ table: 'groupExerciseActions', column: 'userId' },
	{ table: 'groupExerciseActions', column: 'groupExerciseEventId' },
	{ table: 'courseBlocks', column: 'courseId' },
] as const

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.sequelize.transaction(async transaction => {
		for (const { table, column } of foreignKeys) {
			const result = await queryInterface.sequelize.query<{ count: number }>(`SELECT COUNT(*)::integer AS "count" FROM "${table}" WHERE "${column}" IS NULL`, { type: QueryTypes.SELECT, transaction })
			const count = result[0]?.count
			if (count === undefined) throw new Error(`Could not check ${table}.${column} for NULL values.`)
			if (count > 0) throw new Error(`Cannot make ${table}.${column} non-nullable: found ${count} row(s) containing NULL.`)
		}

		for (const { table, column } of foreignKeys) {
			await queryInterface.sequelize.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" SET NOT NULL`, { transaction })
		}
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.sequelize.transaction(async transaction => {
		for (const { table, column } of foreignKeys) {
			await queryInterface.sequelize.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" DROP NOT NULL`, { transaction })
		}
	})
}
