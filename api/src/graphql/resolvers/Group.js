const { UniqueConstraintError } = require('sequelize')
const { ForbiddenError, UserInputError } = require('apollo-server-express')

const { getSubscription } = require('../util/subscriptions')
const { events, getUserGroups, getUserGroupsAndDeactivate, getGroup, createRandomCode } = require('../util/Group')

const resolvers = {
	Group: {
		members: group => group.getMembers()
	},

	Member: {
		groupId: member => member.groupMembership.groupId, // This is needed for efficient caching.
		userId: member => member.id,
		active: member => member.groupMembership.active,
	},

	Query: {
		myGroups: async (_source, _args, { db, getCurrentUserId }) => {
			return await getUserGroups(db, getCurrentUserId())
		},

		myActiveGroup: async (_source, _args, { db, getCurrentUserId }) => {
			// Load all groups and find the active one. (Yes, a bit inefficient, but the number of groups is always small.)
			const groups = await getUserGroups(db, getCurrentUserId())
			return groups.find(group => group.groupMembership.active)
		},

		group: async (_source, { code }, { getCurrentUserId, db }) => {
			// Load the group with the given code.
			const userId = getCurrentUserId()
			const group = await getGroup(db, code)

			// Check that the user is allowed to see the group.
			const members = await group.getMembers()
			const member = members.find(member => member.id === userId)
			if (!member)
				throw new ForbiddenError('Failed to load group data: only members have access.')

			return group
		},
	},

	Mutation: {
		createGroup: async (_source, _args, { db, pubsub, getCurrentUserId }) => {
			// Create a new group with a random code. The code may already exist in the database, so we have re-try until it eventually succeeds. Even though a collision is not very likely, we still bail out at some point, otherwise the server would be blocked completely.
			const group = await (async () => {
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
				throw new Error('Failed to create group: not enough unique codes remaining.')
			})()

			// Deactivate the user from other groups.
			const userId = getCurrentUserId()
			await getUserGroupsAndDeactivate(db, pubsub, userId)

			// The creator automatically joins the group.
			const member = await group.addMember(userId, { through: { active: true } })
			await pubsub.publish(events.groupUpdated, { updatedGroup: group, userId })

			return group
		},

		joinGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			// Deactivate the user from other groups.
			const userId = getCurrentUserId()
			const groups = await getUserGroupsAndDeactivate(db, pubsub, userId)
			if (groups.find(group => group.code === code))
				throw new UserInputError(`Failed to join group: user is already a member of group "${code}".`)

			// Load the group and add the user.
			const group = await getGroup(db, code)
			await group.addMember(userId, { through: { active: true } })
			await pubsub.publish(events.groupUpdated, { updatedGroup: group, userId })

			return group
		},

		leaveGroup: async (_source, { code }, { getCurrentUserId, db, pubsub }) => {
			// Load the group and remove the user.
			const userId = getCurrentUserId()
			const group = await getGroup(db, code)
			await group.removeMember(userId)
			await pubsub.publish(events.groupUpdated, { updatedGroup: group, userId })

			// When the group is left empty, remove it.
			const members = await group.getMembers()
			if (members.length === 0)
				await group.destroy()

			return true
		},

		activateGroup: async (_source, { code }, { db, pubsub, getCurrentUserId }) => {
			// Deactivate the user from other groups.
			const userId = getCurrentUserId()
			const groups = await getUserGroupsAndDeactivate(db, pubsub, userId, code)

			// Extract the given group.
			const group = groups.find(group => group.code === code)
			if (!group)
				throw new UserInputError(`Failed to activate group: user is not a member of group "${code}".`)

			// Activate the given group.
			const membership = group.members.find(member => member.id === userId).groupMembership
			if (membership && !membership.active) {
				await membership.update({ active: true })
				await pubsub.publish(events.groupUpdated, { updatedGroup: group })
			}
			return group
		},

		deactivateGroup: async (_source, { code }, { db, pubsub, getCurrentUserId }) => {
			// Load the group and check the user's membership.
			const userId = getCurrentUserId()
			const group = await getGroup(db, code)
			const member = group.members.find(member => member.id === userId)
			if (!member)
				throw new Error(`Failed to deactivate group: user is not a member of group "${code}".`)

			// Deactivate the user within the group.
			const membership = member.groupMembership
			if (membership && membership.active) {
				await membership.update({ active: false })
				await pubsub.publish(events.groupUpdated, { updatedGroup: group })
			}
			return group
		},
	},

	Subscription: {
		...getSubscription('groupUpdate', [events.groupUpdated], ({ updatedGroup }, { code }) => {
			// Only pass on when the code matches.
			if (updatedGroup.code === code)
				return updatedGroup
		}),
		...getSubscription('myGroupsUpdate', [events.groupUpdated], ({ updatedGroup, userId: eventUserId }, _args, { getCurrentUserId }) => {
			// Only pass on the updated group when the user is a member.
			const userId = getCurrentUserId()
			if (userId === eventUserId || (updatedGroup.members && updatedGroup.members.some(member => member.id === userId)))
				return updatedGroup
		}),
	}
}

module.exports = resolvers
