import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.createTable('courseBlocks', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false,
			primaryKey: true,
		},
		courseId: {
			type: DataTypes.UUID,
			references: {
				model: 'courses',
				key: 'id',
			},
			onUpdate: 'cascade',
			onDelete: 'cascade',
		},
		index: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		goals: {
			type: DataTypes.ARRAY(DataTypes.STRING),
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
	await queryInterface.addIndex('courseBlocks', {
		fields: ['courseId', 'index'],
		name: 'course_blocks_course_id_index',
		unique: true,
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.dropTable('courseBlocks')
}
