const { findGroupByCode, createRandomCode } = require('../util/Group')
const { UniqueConstraintError } = require('sequelize')
const { withFilter } = require('graphql-subscriptions')
const { ForbiddenError, UserInputError } = require('apollo-server-express')

const EVENT = {
	GROUP_UPDATED: 'GROUP_UPDATED',
}

const resolvers = {
	Group: {
		members: async group => {
			const members = await group.getMembers()
			return members.map(member => {
				member.active = member.groupMembership.active
				return member
			})
		},
		active: group => group.groupMembership.active,
	},

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

		myActiveGroup: async (_source, _args, { getCurrentUserId, db }) => {
			// Load all groups and find the active one.
			const userWithGroups = await db.User.findByPk(getCurrentUserId(), {
				include: {
					association: 'groups',
					include: {
						association: 'members',
					}
				},
			})
			return userWithGroups?.groups?.find(group => group.groupMembership.active)
		},

		group: async (_source, { code }, { getCurrentUserId, db }) => {
			const userId = getCurrentUserId()
			const group = await findGroupByCode(db, code)

			// Retrieve the membership of the current user and check it.
			const members = await group.getMembers()
			const member = members.find(member => member.id === userId)
			if (!member)
				throw new ForbiddenError('Only members can see group data.')

			// Set membership within the group too.
			group.groupMembership = member.groupMembership
			return group
		},
	},

	Mutation: {
		createGroup: async (_source, _args, { db, getCurrentUserId }) => {
			const userId = getCurrentUserId()

			// ToDo: deactivate the user from other groups.

			const group = await (async () => {
				// Create a new group with a random code. The code may already exist in the database, so we have re-try until it eventually succeeds. Even though a collision is not very likely, we still bail out at some point, otherwise the server would be blocked completely.
				for (let i = 10; i > 0; --i) {
					try {
						return await db.Group.create({
							code: createRandomCode(),
						})
					} catch (e) {
						if (e instanceof UniqueConstraintError)
							continue // Try again...
						throw e
					}
				}
				throw new Error('Cannot create new group with unique code.')
			})()

			// The creator automatically joins the group.
			group.groupMembership = await group.addMember(userId, { through: { active: true } })
			return group
		},

		joinGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			const userId = getCurrentUserId()

			const group = await findGroupByCode(db, code)
			const newGroupMemberships = await group.addMember(userId, { through: { active: true } })
			group.groupMembership = newGroupMemberships[0]

			await pubsub.publish(EVENT.GROUP_UPDATED, { groupUpdated: group })

			return group
		},

		leaveGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			const userId = getCurrentUserId()

			const group = await findGroupByCode(db, code)
			await group.removeMember(userId)

			// After the last member has left, the group is deleted altogether.
			const members = await group.getMembers()
			if (members.length === 0)
				await group.destroy()

			await pubsub.publish(EVENT.GROUP_UPDATED, { groupUpdated: group })

			return true
		},

		activateGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			// Load all groups and find the one with the given code.
			const userId = getCurrentUserId()
			const userWithGroups = await db.User.findByPk(userId, {
				include: {
					association: 'groups',
					include: {
						association: 'members',
					}
				},
			})
			const groups = userWithGroups?.groups
			if (!groups)
				throw new UserInputError('User does not have groups.')
			const group = userWithGroups.groups.find(group => group.code === code)
			if (!group)
				throw new UserInputError('User is not in the given group.')

			// Deactivate all other groups. (Usually not needed.)
			await Promise.all(groups.map(async group => {
				if (group.code !== code) {
					const membership = group.members.find(member => member.id === userId).groupMembership
					if (membership && membership.active) {
						await membership.update({ active: false })
						await pubsub.publish(EVENT.GROUP_UPDATED, { groupUpdated: group })
					}
				}
			}))

			// Activate given group.
			const membership = group.members.find(member => member.id === userId).groupMembership
			if (membership && !membership.active) {
				await membership.update({ active: true })
				await pubsub.publish(EVENT.GROUP_UPDATED, { groupUpdated: group })
			}
			return group
		},

		deactivateGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			// Find the current user as a member of a group.
			const userId = getCurrentUserId()
			const group = await findGroupByCode(db, code)
			const member = group.members.find(member => member.id === userId)

			// If the user is a part of the group, set group membership to false.
			const membership = member?.groupMembership
			if (membership && membership.active) {
				membership.update({ active: false })
				await pubsub.publish(EVENT.GROUP_UPDATED, { groupUpdated: group })
			}
			return group
		},
	},

	Subscription: {
		groupUpdated: {
			subscribe: withFilter(
				(_source, _args, { pubsub }) => pubsub.asyncIterator([EVENT.GROUP_UPDATED]),
				({ groupUpdated }, { code }) => groupUpdated.code === code,
			),
		}
	}
}

module.exports = resolvers
