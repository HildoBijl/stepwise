import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	const definition = { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
	await queryInterface.addColumn('exerciseSamples', 'initialState', definition)
	await queryInterface.addColumn('groupExerciseSamples', 'initialState', definition)
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeColumn('groupExerciseSamples', 'initialState')
	await queryInterface.removeColumn('exerciseSamples', 'initialState')
}
