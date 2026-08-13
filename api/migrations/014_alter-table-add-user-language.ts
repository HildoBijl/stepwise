import { DataTypes, type QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.addColumn('users', 'language', {
		type: DataTypes.STRING(5),
		allowNull: true,
	})
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.removeColumn('users', 'language')
}
