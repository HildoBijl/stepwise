import { DataTypes, type QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
	// We better let Sequelize take care of introducing a unique constraint with an index via the `unique: true` property, instead of creating the index manually. So we remove the index created in migration 008 and re-introduce it below via the property.
	await queryInterface.removeIndex('users', 'users_email')

	// The NON NULL constraint was accidentally removed in migration 006, so we bring it back here.
	await queryInterface.changeColumn('users', 'email', {
		type: DataTypes.TEXT,
		allowNull: false,
		unique: true,
	})
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.changeColumn('users', 'email', {
		type: DataTypes.TEXT,
		allowNull: true,
		unique: false,
	})

	await queryInterface.addIndex('users', {
		fields: ['email'],
		unique: true,
	})
}
