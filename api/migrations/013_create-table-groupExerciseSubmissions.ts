import { DataTypes, type QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
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

export async function down(queryInterface: QueryInterface): Promise<void> {
	queryInterface.dropTable('groupExerciseSubmissions')
}
