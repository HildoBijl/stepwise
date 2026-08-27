import { UniqueConstraintError } from 'sequelize'
import { ForbiddenError, UserInputError } from '../../errors.ts'

import type { ApiContext } from '../types.ts'
import type { AuthenticatedContext } from '../user/index.ts'
import { getSubscription } from '../subscriptions.ts'

import type { GroupMemberRecord, GroupRecord } from './models.ts'
import { type GroupUpdatedPayload, createRandomCode, deactivateUserGroups, getGroup, getUserGroups, getUserWithDeactivatedGroups, getUserWithGroups, groupEvents } from './service.ts'

type GroupContext = Pick<ApiContext, 'db'>
type AuthenticatedGroupContext = Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn' | 'pubsub' | 'userId'>

export const groupResolvers = {
	Group: {
		members: (group: GroupRecord) => group.members ?? group.getMembers(),
	},

	Member: {
		groupId: (member: GroupMemberRecord) => member.groupMembership.groupId, // This is needed for efficient caching.
		userId: (member: GroupMemberRecord) => member.id,
		active: (member: GroupMemberRecord) => member.groupMembership.active,
		lastActivity: (member: GroupMemberRecord) => member.groupMembership.updatedAt,
	},

	Query: {
		myGroups: async (_source: unknown, _args: unknown, { db, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			return getUserGroups(db, userId)
		},

		groupExists: async (_source: unknown, { code }: { code: string }, { db }: GroupContext) => {
			try {
				await getGroup(db, code)
				return true
			} catch {
				return false
			}
		},

		myActiveGroup: async (_source: unknown, _args: unknown, { db, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			return (await getUserGroups(db, userId, true))[0]
		},

		group: async (_source: unknown, { code }: { code: string }, { db, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			const group = await getGroup(db, code, true)
			const member = group.members.find(member => member.id === userId)
			if (!member) throw new ForbiddenError('Failed to load group data: only members have access.')
			return group
		},
	},

	Mutation: {
		createGroup: async (_source: unknown, _args: unknown, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
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

		joinGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			// Deactivate the user from other groups.
			ensureLoggedIn()
			const user = await getUserWithDeactivatedGroups(db, pubsub, userId, code)
			const groups = user.groups

			// If the user is already a member of the group, simply activate the membership.
			const existingGroup = groups.find(group => group.code === code)
			const existingMember = existingGroup?.members.find(member => member.id === userId)
			const existingMembership = existingMember?.groupMembership
			if (existingGroup && existingMember && existingMembership) {
				if (!existingMembership.active) {
					existingMember.groupMembership = await existingMembership.update({ active: true })
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

		activateGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			// Deactivate the user from other groups.
			ensureLoggedIn()
			const user = await getUserWithDeactivatedGroups(db, pubsub, userId, code)
			const groups = user.groups

			// Extract the given group.
			const group = groups.find(group => group.code === code)
			if (!group) throw new UserInputError(`Failed to activate group: user is not a member of group "${code}".`)

			// Activate the given group.
			const member = group.members.find(member => member.id === userId)
			if (!member) throw new Error(`Failed to find user "${userId}" among members of group "${code}".`)
			const membership = member.groupMembership
			if (!membership.active) {
				member.groupMembership = await membership.update({ active: true })
				await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId, action: 'activate' })
			}
			return group
		},

		deactivateGroup: async (_source: unknown, _args: unknown, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			// Load all groups, find one where the user is active (so it may be returned as the deactivated group) and then deactivate all groups.
			ensureLoggedIn()
			const user = await getUserWithGroups(db, userId)
			const groups = user.groups
			const activeGroup = groups.find(group => group.members.some(member => member.id === userId && member.groupMembership.active))
			await deactivateUserGroups(pubsub, user)
			return activeGroup
		},
	},

	Subscription: {
		...getSubscription('groupUpdate', [groupEvents.groupUpdated], ({ updatedGroup }: GroupUpdatedPayload, { code }: { code: string }) => {
			// Only pass on when the code matches.
			if (updatedGroup.code === code) return updatedGroup
		}),

		...getSubscription('myActiveGroupUpdate', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId, action }: GroupUpdatedPayload, _args: unknown, { userId }: AuthenticatedGroupContext) => {
			// If the user caused this update, always pass the group on. The client can incorporate the data appropriately.
			if (userId === eventUserId && action === 'deactivate') return updatedGroup

			// If this is the user's active group, also pass it on.
			const member = updatedGroup.members.find(member => member.id === userId)
			if (member && member.groupMembership.active) return updatedGroup
		}),

		...getSubscription('myGroupsUpdate', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId }: GroupUpdatedPayload, _args: unknown, { userId }: AuthenticatedGroupContext) => {
			// Only pass on the updated group when the user caused this event (like deactivated) or when the user is a member.
			if (userId === eventUserId || updatedGroup.members.some(member => member.id === userId)) return updatedGroup
		}),
	},
}
