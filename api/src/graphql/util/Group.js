const { UserInputError } = require('apollo-server-express')

/**
 * Tries to find a group with that code in the database and returns it.
 * If the group doesn’t exist, it throws an error.
 * The code parameter is case-insensitive.
 */
async function findGroupByCode(db, code) {
	const group = await db.Group.findOne({
		where: { code: code.toUpperCase() },
		include: {
			association: 'members',
		},
	})
	if (!group) {
		throw new UserInputError('No such group')
	}
	return group
}

module.exports.findGroupByCode = findGroupByCode
