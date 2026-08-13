import { DataTypes, type QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
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
		unique: true,
	})
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.dropTable('courseBlocks')
}
