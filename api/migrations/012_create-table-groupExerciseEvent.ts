import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.createTable('groupExerciseEvents', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		groupExerciseSampleId: {
			type: DataTypes.UUID,
			references: {
				model: 'groupExerciseSamples',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
		},
		progress: {
			type: DataTypes.JSON,
			allowNull: true,
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
	queryInterface.dropTable('groupExerciseEvents')
}
