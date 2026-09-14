import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addColumn('exerciseEvents', 'report', { type: DataTypes.JSON, allowNull: true })
	await queryInterface.addColumn('groupExerciseEvents', 'report', { type: DataTypes.JSON, allowNull: true })
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeColumn('groupExerciseEvents', 'report')
	await queryInterface.removeColumn('exerciseEvents', 'report')
}
