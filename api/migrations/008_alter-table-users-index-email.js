module.exports = {
	up: async (queryInterface) => {
		await queryInterface.addIndex('users', {
			fields: ['email'],
			unique: true,
		})
	},

	down: async (queryInterface) => {
		await queryInterface.removeIndex('users', 'users_email')
	},
}
