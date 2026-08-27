import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addColumn('users', 'language', {
		type: DataTypes.STRING(5),
		allowNull: true,
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeColumn('users', 'language')
}
