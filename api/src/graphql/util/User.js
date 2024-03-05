// getUser returns a user with given id from the database. It does not check rights.
async function getUser(db, userId) {
	const user = await db.User.findByPk(userId)
	if (!user)
		throw new UserInputError(`Invalid request: unknown user ID "${userId}".`)
	return user
}
module.exports.getUser = getUser

// getAllUsers returns all users. It does not check whether the current user has rights for it.
async function getAllUsers(db) {
	return await db.User.findAll({
		include: {
			association: 'skills',
			required: false,
		},
	})
}
module.exports.getAllUsers = getAllUsers
