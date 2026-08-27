import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.createTable('groupExerciseSubmissions', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
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
		groupExerciseEventId: {
			type: DataTypes.UUID,
			references: {
				model: 'groupExerciseEvents',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
		},
		action: {
			type: DataTypes.JSON,
			allowNull: false,
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
	await queryInterface.addIndex('groupExerciseSubmissions', {
		fields: ['userId', 'groupExerciseEventId'],
		unique: true,
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.dropTable('groupExerciseSubmissions')
}
