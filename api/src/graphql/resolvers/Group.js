const { findGroupByCode } = require('../util/Group')
const { UniqueConstraintError } = require('sequelize')
const { randomInt } = require('crypto')

const resolvers = {
	Query: {
		myGroups: async (_source, _args, { getCurrentUserId, db }) => {
			const userWithGroups = await db.User.findByPk(getCurrentUserId(), {
				include: {
					association: 'groups',
				},
			})
			return userWithGroups?.groups
		},

		group: async (_source, { code }, { ensureLoggedIn, db }) => {
			ensureLoggedIn()
			// TODO Question: Can I get group info when I’m not member?
			return findGroupByCode(db, code)
		},
	},

	Mutation: {
		createGroup: async (_source, _args, { ensureLoggedIn, db }) => {
			ensureLoggedIn()
			const group = await (async () => {
				// Create a new group with a random code. The code may already exist
				// in the database, so we have re-try until it eventually succeeds.
				// Even though a collision is not very likely, we still bail out at some
				// point, otherwise the server would be blocked completely.
				for (let i = 10; i > 0; --i) {
					try {
						return await db.Group.create({
							code: createRandomCode(),
						})
					} catch(e) {
						if (e instanceof UniqueConstraintError) {
							continue // Try again...
						}
						throw e
					}
				}
				throw new Error('Cannot create new group with unique code')
			})()
			// TODO Question: Shall the creator automatically join the group?
			return group
		},

		deleteGroup: async (_source, { code }, { ensureLoggedIn, db }) => {
			// TODO Question: Should a group ever be deletable?
			// TODO Question: Can I delete a group that I am not a member of?
			// TODO Question: Can I delete a non-empty group, i.e. one that currently has members?
			ensureLoggedIn()
			const group = await findGroupByCode(db, code)
			await group.destroy()
			return true
		},

		joinGroup: async (_source, { code }, { getCurrentUserId, db }) => {
			const userId = getCurrentUserId()
			const group = await findGroupByCode(db, code)
			await group.addMember(userId)
			return group
		},

		leaveGroup: async (_source, { code }, { getCurrentUserId, db }) => {
			// TODO Question: When the last member has left, shall the group be automatically deleted?
			const userId = getCurrentUserId()
			const group = await findGroupByCode(db, code)
			await group.removeMember(userId)
			return true
		},
	},
}

/**
 * Generates a random group code.
 * The code consists of uppercase letters and digits.
 * It doesn’t contain homoglyphs, i.e. characters that look similar and
 * can thus be easily confused. E.g.: O <> 0, I <> 1 or 5 <> S
 */
function createRandomCode() {
	const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789'
	const LENGTH = 5
	let result = ''
    for (let i = LENGTH; i > 0; --i) {
		result += ALPHABET[randomInt(0, ALPHABET.length)]
	}
    return result
}

module.exports = resolvers
