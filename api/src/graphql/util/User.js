// getUser returns a user with given id from the database. It does not check rights.
export async function getUser(db, userId) {
	const user = await db.User.findByPk(userId)
	if (!user)
		throw new UserInputError(`Invalid request: unknown user ID "${userId}".`)
	return user
}

// getAllUsers returns all users. It does not check whether the current user has rights for it.
export async function getAllUsers(db) {
	return await db.User.findAll({
		include: {
			association: 'skills',
			required: false,
		},
	})
}
