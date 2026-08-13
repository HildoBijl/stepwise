import { DataTypes, type QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.createTable('surfConextProfiles', {
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			references: {
				model: 'users',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
		},
		schacHomeOrganization: {
			type: DataTypes.STRING,
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	})
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	queryInterface.dropTable('surfConextProfiles')
}
