import { DataTypes, type QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.addColumn('users', 'privacyPolicyAcceptedVersion', {
		type: DataTypes.INTEGER,
		allowNull: true,
	})
	await queryInterface.addColumn('users', 'privacyPolicyAcceptedAt', {
		type: DataTypes.DATE,
		allowNull: true,
	})
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.removeColumn('users', 'privacyPolicyAcceptedVersion')
	await queryInterface.removeColumn('users', 'privacyPolicyAcceptedAt')
}
