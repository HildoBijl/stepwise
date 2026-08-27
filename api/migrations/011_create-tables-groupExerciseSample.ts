import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.createTable('groupExerciseSamples', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		groupId: {
			type: DataTypes.UUID,
			references: {
				model: 'groups',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
		},
		skillId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		exerciseId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		state: {
			type: DataTypes.JSON,
			allowNull: false,
		},
		active: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
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
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	queryInterface.dropTable('groupExerciseSamples')
}
