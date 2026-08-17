import { DataTypes } from 'sequelize'
import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.createTable('exerciseEvents', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		action: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		progress: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		exerciseSampleId: {
			type: DataTypes.UUID,
			references: {
				model: 'exerciseSamples',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
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

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	queryInterface.dropTable('exerciseEvents')
}
