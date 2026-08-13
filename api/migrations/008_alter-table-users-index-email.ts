import type { QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.addIndex('users', {
		fields: ['email'],
		unique: true,
	})
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.removeIndex('users', 'users_email')
}
