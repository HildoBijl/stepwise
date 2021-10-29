import { DataTypes } from 'sequelize'

const TABLE_COLUMN = [
	// [tableName, columnName, allowNull]
	['users', 'name', false],
	['users', 'email', false],
	['userSkills', 'skillId', false],
	['surfConextProfiles', 'id', false],
	['surfConextProfiles', 'schacHomeOrganization', true],
	['exerciseSamples', 'exerciseId', false],
]

export default {
	up: async (queryInterface) => {
		for await (const p of TABLE_COLUMN) {
			await queryInterface.changeColumn(p[0], p[1], {
				type: DataTypes.TEXT,
				allowNull: p[2],
			})
		}
	},

	down: async (queryInterface) => {
		for await (const p of TABLE_COLUMN) {
			await queryInterface.changeColumn(p[0], p[1], {
				type: DataTypes.STRING,
				allowNull: p[2],
			})
		}
	},

}
