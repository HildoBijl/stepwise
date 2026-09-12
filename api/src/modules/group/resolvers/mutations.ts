import { UniqueConstraintError } from 'sequelize'

import { InvalidInputError } from '../../../errors.ts'

import { hasLoadedGroupMembers } from '../models.ts'
import { createRandomGroupCode, deactivateUserGroupMemberships, ensureGroupMembership, getGroup, getUserWithGroups, groupEvents, publishDeactivatedGroupMemberships } from '../service.ts'
import type { AuthenticatedGroupContext, CleanUpGroupMember } from './types.ts'

export function createGroupMutationResolvers(cleanUpGroupMember: CleanUpGroupMember) {
	return {
		leaveGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
			ensureSignedIn()
			const result = await db.transaction(async transaction => {
				const group = await getGroup(db, code, { transaction, lock: transaction.LOCK.UPDATE })
				group.members = await group.getMembers({ transaction })
				if (!hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
				ensureGroupMembership(group, userId)
				group.members = group.members.filter(member => member.id !== userId)
				if (group.members.length === 0) {
					await group.destroy({ transaction })
					return { group, publishCleanup: undefined }
				}

				const publishCleanup = await cleanUpGroupMember(db, group, userId, transaction, pubsub)
				await group.removeMember(userId, { transaction })
				return { group, publishCleanup }
			})

			await result.publishCleanup?.()
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId, removedForUser: true })
			return true
		},

		createGroup: async (_source: unknown, _args: unknown, { db, pubsub, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
			ensureSignedIn()

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
			await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId })
			return result.group
		},

		joinGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
			ensureSignedIn()
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
					return { group: existingGroup, deactivatedGroups, updated: activated }
				}

				// Add the user to the group.
				await group.addMember(userId, { through: { active: true }, transaction })
				group.members = await group.getMembers({ transaction })
				return { group, deactivatedGroups, updated: true }
			})

			await publishDeactivatedGroupMemberships(pubsub, result.deactivatedGroups, userId)
			if (result.updated) await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId })
			return result.group
		},

		activateGroup: async (_source: unknown, { code }: { code: string }, { db, pubsub, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
			ensureSignedIn()
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
			if (result.activated) await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: result.group, userId })
			return result.group
		},

		deactivateGroup: async (_source: unknown, _args: unknown, { db, pubsub, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
			// Load all groups, find one where the user is active (so it may be returned as the deactivated group) and then deactivate all groups.
			ensureSignedIn()
			const result = await db.transaction(async transaction => {
				const user = await getUserWithGroups(db, userId, { transaction })
				const activeGroup = user.groups.find(group => group.members.some(member => member.id === userId && member.groupMembership.active))
				const deactivatedGroups = await deactivateUserGroupMemberships(user, { transaction })
				return { activeGroup, deactivatedGroups }
			})
			await publishDeactivatedGroupMemberships(pubsub, result.deactivatedGroups, userId)
			return result.activeGroup
		},
	}
}
