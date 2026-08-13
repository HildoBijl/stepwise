import { DataTypes, type QueryInterface } from 'sequelize'

const TABLE_COLUMN: [string, string, boolean][] = [
	// [tableName, columnName, allowNull]
	['users', 'name', false],
	['users', 'email', false],
	['userSkills', 'skillId', false],
	['surfConextProfiles', 'id', false],
	['surfConextProfiles', 'schacHomeOrganization', true],
	['exerciseSamples', 'exerciseId', false],
]

export async function up(queryInterface: QueryInterface): Promise<void> {
	for await (const p of TABLE_COLUMN) {
		await queryInterface.changeColumn(p[0], p[1], {
			type: DataTypes.TEXT,
			allowNull: p[2],
		})
	}
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	for await (const p of TABLE_COLUMN) {
		await queryInterface.changeColumn(p[0], p[1], {
			type: DataTypes.STRING,
			allowNull: p[2],
		})
	}
}
