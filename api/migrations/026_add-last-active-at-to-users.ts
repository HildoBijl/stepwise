import { DataTypes, col } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.sequelize.transaction(async transaction => {
		await queryInterface.addColumn('users', 'lastActiveAt', {
			type: DataTypes.DATE,
			allowNull: true,
		}, { transaction })
		await queryInterface.bulkUpdate('users', { lastActiveAt: col('updatedAt') }, {}, { transaction })
		await queryInterface.changeColumn('users', 'lastActiveAt', {
			type: DataTypes.DATE,
			allowNull: false,
		}, { transaction })
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.removeColumn('users', 'lastActiveAt')
}
