const { findGroupByCode, createRandomCode } = require('../util/Group')
const { UniqueConstraintError } = require('sequelize')
const { ForbiddenError } = require('apollo-server-express')

const resolvers = {
	Query: {
		myGroups: async (_source, _args, { getCurrentUserId, db }) => {
			const userWithGroups = await db.User.findByPk(getCurrentUserId(), {
				include: {
					association: 'groups',
					include: {
						association: 'members',
					}
				},
			})
			return userWithGroups?.groups
		},

		group: async (_source, { code }, { getCurrentUserId, db }) => {
			const userId = getCurrentUserId()

			const group = await findGroupByCode(db, code)
			const members = await group.getMembers()
			if (!members.find(m => m.id === userId)) {
				throw new ForbiddenError('Only members can see group data.')
			}

			return group
		},
	},

	Mutation: {
		createGroup: async (_source, _args, { db, getCurrentUserId }) => {
			const userId = getCurrentUserId()

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

			// The creator automatically joins the group.
			await group.addMember(userId)

			return group
		},

		joinGroup: async (_source, { code }, { getCurrentUserId, db }) => {
			const userId = getCurrentUserId()

			const group = await findGroupByCode(db, code)
			await group.addMember(userId)

			return group
		},

		leaveGroup: async (_source, { code }, { getCurrentUserId, db }) => {
			const userId = getCurrentUserId()

			const group = await findGroupByCode(db, code)
			await group.removeMember(userId)

			// After the last member has left, the group is deleted altogether.
			const members = await group.getMembers()
			if (members.length === 0) {
				await group.destroy()
			}

			return true
		},
	},
}

module.exports = resolvers
