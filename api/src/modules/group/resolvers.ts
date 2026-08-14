import { UniqueConstraintError } from 'sequelize'
import { ForbiddenError, UserInputError } from 'apollo-server-express'

import { getSubscription } from '../subscriptions.js'

import { groupEvents, getUserWithGroups, getUserGroups, getUserWithDeactivatedGroups, deactivateUserGroups, getGroup, createRandomCode } from './service.js'

type ResolverTree = { [key: string]: ResolverTree | ((...args: any[]) => any) }
export const groupResolvers: ResolverTree = {
	Group: {
		members: group => group.members ?? group.getMembers(),
	},

	Member: {
		groupId: member => member.groupMembership.groupId, // This is needed for efficient caching.
		userId: member => member.id,
		active: member => member.groupMembership.active,
		lastActivity: member => member.groupMembership.updatedAt,
	},

	Query: {
		myGroups: async (_source, _args, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			return await getUserGroups(db, userId)
		},

		groupExists: async (_source, { code }, { db }) => {
			try {
				await getGroup(db, code)
				return true
			} catch {
				return false
			}
		},

		myActiveGroup: async (_source, _args, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			return (await getUserGroups(db, userId, true))[0]
		},

		group: async (_source, { code }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			const group = await getGroup(db, code, true)
			const member = group.members.find((member: any) => member.id === userId)
			if (!member) throw new ForbiddenError('Failed to load group data: only members have access.')
			return group
		},
	},

	Mutation: {
		createGroup: async (_source, _args, { db, pubsub, ensureLoggedIn, userId }) => {
			ensureLoggedIn()

			// Create a new group with a random code. The code may already exist in the database, so we have re-try until it eventually succeeds. Even though a collision is not very likely, we still bail out at some point, otherwise the server would be blocked completely.
			const group = await (async () => {
				for (let i = 10; i > 0; --i) {
					try {
						return await db.Group.create({ code: createRandomCode() })
					} catch (e) {
						if (e instanceof UniqueConstraintError) continue // Try again...
						throw e
					}
				}
				throw new Error('Failed to create group: not enough unique codes remaining.')
			})()

			// Deactivate the user from other groups.
			await getUserWithDeactivatedGroups(db, pubsub, userId)

			// The creator automatically joins the group.
			await group.addMember(userId, { through: { active: true } })
			group.members = await group.getMembers()
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'create' })
			return group
		},

		joinGroup: async (_source, { code }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Deactivate the user from other groups.
			ensureLoggedIn()
			const user = await getUserWithDeactivatedGroups(db, pubsub, userId, code)
			const groups = user.groups

			// If the user is already a member of the group, simply activate the membership.
			const existingGroup = groups.find((group: any) => group.code === code)
			const existingMembership = existingGroup && existingGroup.members && existingGroup.members.find((member: any) => member.id === userId).groupMembership
			if (existingMembership) {
				if (!existingMembership.active) {
					await existingMembership.update({ active: true })
					existingGroup.members = await existingGroup.getMembers()
					await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: existingGroup, userId, action: 'activate' })
				}
				return existingGroup
			}

			// Load the group and add the user.
			const group = await getGroup(db, code)
			await group.addMember(userId, { through: { active: true } })
			group.members = await group.getMembers()
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'join' })
			return group
		},

		activateGroup: async (_source, { code }, { db, pubsub, ensureLoggedIn, userId }) => {
			// Deactivate the user from other groups.
			ensureLoggedIn()
			const user = await getUserWithDeactivatedGroups(db, pubsub, userId, code)
			const groups = user.groups

			// Extract the given group.
			const group = groups.find((group: any) => group.code === code)
			if (!group) throw new UserInputError(`Failed to activate group: user is not a member of group "${code}".`)

			// Activate the given group.
			const member = group.members.find((member: any) => member.id === userId)
			const membership = member.groupMembership
			if (membership && !membership.active) {
				member.groupMembership = await membership.update({ active: true })
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'activate' })
			}
			return group
		},

		deactivateGroup: async (_source, _args, { db, pubsub, ensureLoggedIn, userId }) => {
			// Load all groups, find one where the user is active (so it may be returned as the deactivated group) and then deactivate all groups.
			ensureLoggedIn()
			const user = await getUserWithGroups(db, userId)
			const groups = user.groups
			const activeGroup = groups.find((group: any) => group.members.some((member: any) => member.id === userId && member.groupMembership.active))
			await deactivateUserGroups(pubsub, user)
			return activeGroup
		},
	},

	Subscription: {
		...getSubscription('groupUpdate', [groupEvents.groupUpdated], ({ updatedGroup }: any, { code }: any) => {
			// Only pass on when the code matches.
			if (updatedGroup.code === code) return updatedGroup
		}),

		...getSubscription('myActiveGroupUpdate', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId, action }: any, _args: any, { userId }: any) => {
			// If the user caused this update, always pass the group on. The client can incorporate the data appropriately.
			if (userId === eventUserId && action === 'deactivate') return updatedGroup

			// If this is the user's active group, also pass it on.
			const member = updatedGroup.members && updatedGroup.members.find((member: any) => member.id === userId)
			if (member && member.groupMembership.active) return updatedGroup
		}),

		...getSubscription('myGroupsUpdate', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId }: any, _args: any, { userId }: any) => {
			// Only pass on the updated group when the user caused this event (like deactivated) or when the user is a member.
			if (userId === eventUserId || (updatedGroup.members && updatedGroup.members.some((member: any) => member.id === userId))) return updatedGroup
		}),
	},
}
