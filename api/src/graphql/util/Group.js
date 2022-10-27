const { UserInputError } = require('apollo-server-express')
const { numberArray } = require('step-wise/util/arrays')
const { selectRandomly } = require('step-wise/util/random')

const events = {
	groupUpdated: 'GROUP_UPDATED',
}
module.exports.events = events

// getUserWithGroups takes a userId and loads the user with all their groups from the database.
async function getUserWithGroups(db, userId) {
	const user = await db.User.findByPk(userId, {
		include: {
			association: 'groups',
			include: {
				association: 'members',
			}
		},
	})
	if (!user)
		throw new Error(`Failed to load the user with ID "${userId}".`)
	return user
}
module.exports.getUserWithGroups = getUserWithGroups

// getUserGroups takes a userId, loads the groups this user belongs to.
async function getUserGroups(db, userId) {
	// Get the groups.
	const userWithGroups = await getUserWithGroups(db, userId)
	const groups = userWithGroups?.groups
	if (!groups)
		throw new Error(`Failed to load groups of user with ID "${userId}".`)
	return groups
}
module.exports.getUserGroups = getUserGroups

// getUserWithDeactivatedGroups takes a userId, loads the groups this user belongs to, and deactivates the user from all of them, except possibly the given exception group code. The user with the updated groups is returned.
async function getUserWithDeactivatedGroups(db, pubsub, userId, exceptionGroupCode) {
	const user = await getUserWithGroups(db, userId)
	user.groups = await deactivateUserGroups(pubsub, user, exceptionGroupCode)
	return user
}
module.exports.getUserWithDeactivatedGroups = getUserWithDeactivatedGroups

// deactivateUserGroups takes a user with its groups and deactivates the user in all groups. It returns all the groups of the user.
async function deactivateUserGroups(pubsub, user, exceptionGroupCode) {
	return await Promise.all(user.groups.map(async group => {
		// If this is the exception that should not be deactivated, do nothing.
		if (exceptionGroupCode && group.code === exceptionGroupCode)
			return group

		// If the user is not active, do nothing.
		const member = group.members.find(member => member.id === user.id)
		const membership = member.groupMembership
		if (!membership || !membership.active)
			return group

		// Adjust the active status, both in the database and in the group.
		member.groupMembership = await membership.update({ active: false })
		await pubsub.publish(events.groupUpdated, { updatedGroup: group, userId: user.id, action: 'deactivate' })
		return group
	}))
}
module.exports.deactivateUserGroups = deactivateUserGroups

// getGroup tries to find a group with that code in the database and returns it. If the group doesn’t exist, it throws an error. The code parameter is case-insensitive.
async function getGroup(db, code) {
	const normalizedCode = code.toUpperCase()
	const group = await db.Group.findOne({
		where: { code: normalizedCode },
		include: {
			association: 'members',
		},
	})
	if (!group)
		throw new UserInputError('No such group.')
	return group
}
module.exports.getGroup = getGroup

// createRandomCode generates a random group code. The code consists of uppercase letters and digits. It doesn’t contain homoglyphs, i.e. characters that look similar and can thus be easily confused. E.g.: O <> 0, I <> 1 or 5 <> S.
const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789'.split('')
const LENGTH = 4
function createRandomCode() {
	return numberArray(1, LENGTH).map(_ => selectRandomly(ALPHABET)).join('')
}
module.exports.createRandomCode = createRandomCode
