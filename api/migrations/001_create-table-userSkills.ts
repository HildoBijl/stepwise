import { DataTypes } from 'sequelize'

import type { MigrationParameters } from './types.ts'

export async function up({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.createTable('userSkills', {
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
		skillId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		numPracticed: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		coefficients: {
			type: DataTypes.ARRAY(DataTypes.DOUBLE),
			defaultValue: [1],
			allowNull: false,
		},
		coefficientsOn: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false,
		},
		highest: {
			type: DataTypes.ARRAY(DataTypes.DOUBLE),
			defaultValue: [1],
			allowNull: false,
		},
		highestOn: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
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
	await queryInterface.addIndex('userSkills', {
		fields: ['userId', 'skillId'],
		name: 'user_skills_user_id_skill_id',
		unique: true,
	})
}

export async function down({ context: queryInterface }: MigrationParameters): Promise<void> {
	await queryInterface.dropTable('userSkills')
}
