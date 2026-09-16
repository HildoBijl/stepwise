import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addColumn('exerciseSamples', 'exerciseVersion', { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 })
	await queryInterface.addColumn('groupExerciseSamples', 'exerciseVersion', { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 })
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeColumn('groupExerciseSamples', 'exerciseVersion')
	await queryInterface.removeColumn('exerciseSamples', 'exerciseVersion')
}
