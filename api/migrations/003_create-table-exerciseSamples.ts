import { DataTypes } from 'sequelize'
import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.createTable('exerciseSamples', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		userSkillId: {
			type: DataTypes.UUID,
			references: {
				model: 'userSkills',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
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
	queryInterface.dropTable('exerciseSamples')
}
