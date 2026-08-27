import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.addColumn('users', 'privacyPolicyAcceptedVersion', {
		type: DataTypes.INTEGER,
		allowNull: true,
	})
	await queryInterface.addColumn('users', 'privacyPolicyAcceptedAt', {
		type: DataTypes.DATE,
		allowNull: true,
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeColumn('users', 'privacyPolicyAcceptedVersion')
	await queryInterface.removeColumn('users', 'privacyPolicyAcceptedAt')
}
