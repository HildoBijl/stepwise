import { DataTypes } from 'sequelize'

export default {
	up: async (queryInterface) => {
		await queryInterface.addColumn('users', 'privacyPolicyAcceptedVersion', {
			type: DataTypes.INTEGER,
			allowNull: true,
		})
		await queryInterface.addColumn('users', 'privacyPolicyAcceptedAt', {
			type: DataTypes.DATE,
			allowNull: true,
		})
	},

	down: async (queryInterface) => {
		await queryInterface.removeColumn('users', 'privacyPolicyAcceptedVersion')
		await queryInterface.removeColumn('users', 'privacyPolicyAcceptedAt')
	},
}
