import { UniqueConstraintError } from 'sequelize'

import { ForbiddenError, InvalidInputError } from '../../errors.ts'

import type { ApiContext } from '../types.ts'
import type { AuthenticatedContext } from '../user/index.ts'
import { createSubscriptionResolver } from '../subscriptions.ts'

import type { GroupMemberRecord, GroupRecord } from './models.ts'
import { type GroupUpdatedPayload, createRandomGroupCode, deactivateUserGroupMemberships, ensureGroupMembership, getGroup, getUserGroups, getUserWithGroups, groupEvents, publishDeactivatedGroupMemberships } from './service.ts'

type GroupContext = Pick<ApiContext, 'db'>
type AuthenticatedGroupContext = Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn' | 'pubsub' | 'userId'>

export const groupResolvers = {
	Group: {
		members: (group: GroupRecord) => group.members ?? group.getMembers(),
	},

	GroupMember: {
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
			} catch (error) {
				if (error instanceof InvalidInputError) return false
				throw error
			}
		},

		myActiveGroup: async (_source: unknown, _args: unknown, { db, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			return (await getUserGroups(db, userId, { onlyActive: true }))[0]
		},

		group: async (_source: unknown, { code }: { code: string }, { db, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			const group = await getGroup(db, code, { includeMembers: true })
			const member = group.members.find(member => member.id === userId)
			if (!member) throw new ForbiddenError('Failed to load group data: only members have access.')
			return group
		},
	},

	Mutation: {
		createGroup: async (_source: unknown, _args: unknown, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()

			// Create and join a new group atomically. The code may already exist, so retry the entire transaction on a collision.
			const result = await (async () => {
				for (let attemptsRemaining = 10; attemptsRemaining > 0; --attemptsRemaining) {
					try {
						return await db.transaction(async transaction => {
							const group = await db.Group.create({ code: createRandomGroupCode() }, { transaction })
							const user = await getUserWithGroups(db, userId, { transaction })
							const deactivatedGroups = await deactivateUserGroupMemberships(user, { transaction })
							await group.addMember(userId, { through: { active: true }, transaction })
							group.members = await group.getMembers({ transaction })
							return { group, deactivatedGroups }
						})
					} catch (e) {
						if (e instanceof UniqueConstraintError) continue // Try again...
						throw e
					}
				}
				throw new Error('Failed to create group: not enough unique codes remaining.')
			})()

			await publishDeactivatedGroupMemberships(pubsub, result.deactivatedGroups, userId)
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId, action: 'create' })
			return result.group
		},

		joinGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			const result = await db.transaction(async transaction => {
				// Validate the target before changing any existing memberships.
				const group = await getGroup(db, code, { transaction })
				const user = await getUserWithGroups(db, userId, { transaction })
				const deactivatedGroups = await deactivateUserGroupMemberships(user, { exceptionCode: group.code, transaction })

				// If the user is already a member of the group, simply activate the membership.
				const existingGroup = user.groups.find(existingGroup => existingGroup.code === group.code)
				const existingMember = existingGroup?.members.find(member => member.id === userId)
				const existingMembership = existingMember?.groupMembership
				if (existingGroup && existingMember && existingMembership) {
					const activated = !existingMembership.active
					if (activated) {
						existingMember.groupMembership = await existingMembership.update({ active: true }, { transaction })
						existingGroup.members = await existingGroup.getMembers({ transaction })
					}
					return { group: existingGroup, deactivatedGroups, action: activated ? 'activate' as const : undefined }
				}

				// Add the user to the group.
				await group.addMember(userId, { through: { active: true }, transaction })
				group.members = await group.getMembers({ transaction })
				return { group, deactivatedGroups, action: 'join' as const }
			})

			await publishDeactivatedGroupMemberships(pubsub, result.deactivatedGroups, userId)
			if (result.action) await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId, action: result.action })
			return result.group
		},

		activateGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			const result = await db.transaction(async transaction => {
				const user = await getUserWithGroups(db, userId, { transaction })
				const normalizedCode = code.toUpperCase()

				// Validate the target before changing any memberships.
				const group = user.groups.find(group => group.code === normalizedCode)
				if (!group) throw new InvalidInputError(`Failed to activate group: user is not a member of group "${code}".`)

				const deactivatedGroups = await deactivateUserGroupMemberships(user, { exceptionCode: normalizedCode, transaction })
				const member = group.members.find(member => member.id === userId)
				if (!member) throw new Error(`Failed to find user "${userId}" among members of group "${group.code}".`)
				const activated = !member.groupMembership.active
				if (activated) member.groupMembership = await member.groupMembership.update({ active: true }, { transaction })
				return { group, deactivatedGroups, activated }
			})

			await publishDeactivatedGroupMemberships(pubsub, result.deactivatedGroups, userId)
			if (result.activated) await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId, action: 'activate' })
			return result.group
		},

		deactivateGroup: async (_source: unknown, _args: unknown, { db, pubsub, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			// Load all groups, find one where the user is active (so it may be returned as the deactivated group) and then deactivate all groups.
			ensureLoggedIn()
			const result = await db.transaction(async transaction => {
				const user = await getUserWithGroups(db, userId, { transaction })
				const activeGroup = user.groups.find(group => group.members.some(member => member.id === userId && member.groupMembership.active))
				const deactivatedGroups = await deactivateUserGroupMemberships(user, { transaction })
				return { activeGroup, deactivatedGroups }
			})
			await publishDeactivatedGroupMemberships(pubsub, result.deactivatedGroups, userId)
			return result.activeGroup
		},
	},

	Subscription: {
		...createSubscriptionResolver('groupUpdated', [groupEvents.groupUpdated], ({ updatedGroup }: GroupUpdatedPayload, { code }: { code: string }) => {
			// Only pass on when the code matches.
			if (updatedGroup.code === code.toUpperCase()) return updatedGroup
		}, async ({ code }: { code: string }, { db, ensureLoggedIn, userId }: AuthenticatedGroupContext) => {
			ensureLoggedIn()
			ensureGroupMembership(await getGroup(db, code, { includeMembers: true }), userId)
		}),

		...createSubscriptionResolver('myActiveGroupUpdated', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId, action }: GroupUpdatedPayload, _args: unknown, { userId }: AuthenticatedGroupContext) => {
			// If the user caused this update, always pass the group on. The client can incorporate the data appropriately.
			if (userId === eventUserId && action === 'deactivate') return updatedGroup

			// If this is the user's active group, also pass it on.
			const member = updatedGroup.members.find(member => member.id === userId)
			if (member && member.groupMembership.active) return updatedGroup
		}),

		...createSubscriptionResolver('myGroupsUpdated', [groupEvents.groupUpdated], ({ updatedGroup, userId: eventUserId }: GroupUpdatedPayload, _args: unknown, { userId }: AuthenticatedGroupContext) => {
			// Only pass on the updated group when the user caused this event (like deactivated) or when the user is a member.
			if (userId === eventUserId || updatedGroup.members.some(member => member.id === userId)) return updatedGroup
		}),
	},
}
