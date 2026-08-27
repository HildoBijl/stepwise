import type { PubSubEngine } from 'graphql-subscriptions'
import { integerRange, sample } from '@step-wise/js-utils'

import { ForbiddenError, UserInputError } from '../../errors.ts'

import type { UserDatabase } from '../user/index.ts'

import { type GroupModel, type GroupMembershipModel, type GroupRecord, type GroupWithMembers, type UserWithGroups, hasLoadedGroupMembers, hasLoadedUserGroups } from './models.ts'

export interface GroupDatabase extends UserDatabase {
	Group: GroupModel
	GroupMembership: GroupMembershipModel
}

export const groupEvents = { groupUpdated: 'GROUP_UPDATED' } as const

export type GroupUpdateAction = 'activate' | 'create' | 'deactivate' | 'destroy' | 'join' | 'leave'

export interface GroupUpdatedPayload {
	updatedGroup: GroupWithMembers
	userId: string
	action: GroupUpdateAction
}

export function verifyGroupAccess(group: GroupWithMembers | null, userId: string): asserts group is GroupWithMembers {
	if (!group) throw new UserInputError('No group with the given code exists.')
	const member = group.members.find(candidate => candidate.id === userId)
	if (!member) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is not a member.`)
	if (!member.groupMembership.active) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is currently not active in that group.`)
}

export async function getUserWithGroups(db: GroupDatabase, userId: string, onlyActive = false): Promise<UserWithGroups> {
	const user = await db.User.findByPk(userId, {
		include: {
			association: 'groups',
			...(onlyActive ? { through: { where: { active: true } } } : {}),
			include: [{ association: 'members' }],
		},
	})
	if (!user) throw new Error(`Failed to load the user with ID "${userId}".`)
	if (!hasLoadedUserGroups(user) || !user.groups.every(hasLoadedGroupMembers)) throw new Error(`Failed to load groups and their members for user "${userId}".`)
	return user
}

export async function getUserGroups(db: GroupDatabase, userId: string, onlyActive = false): Promise<GroupWithMembers[]> {
	return (await getUserWithGroups(db, userId, onlyActive)).groups
}

export async function deactivateUserGroups(pubsub: PubSubEngine, user: UserWithGroups, exceptionCode?: string): Promise<GroupWithMembers[]> {
	return Promise.all(user.groups.map(async group => {
		if (exceptionCode && group.code === exceptionCode) return group
		const member = group.members.find(candidate => candidate.id === user.id)
		if (!member) throw new Error(`Failed to find user "${user.id}" among members of group "${group.code}".`)
		const membership = member.groupMembership
		if (!membership.active) return group
		member.groupMembership = await membership.update({ active: false })
		await pubsub.publish(groupEvents.groupUpdated, { updatedGroup: group, userId: user.id, action: 'deactivate' })
		return group
	}))
}

export async function getUserWithDeactivatedGroups(db: GroupDatabase, pubsub: PubSubEngine, userId: string, exceptionCode?: string): Promise<UserWithGroups> {
	const user = await getUserWithGroups(db, userId)
	user.groups = await deactivateUserGroups(pubsub, user, exceptionCode)
	return user
}

export function getGroup(db: GroupDatabase, code: string, includeMembers: true): Promise<GroupWithMembers>
export function getGroup(db: GroupDatabase, code: string, includeMembers?: false): Promise<GroupRecord>
export async function getGroup(db: GroupDatabase, code: string, includeMembers = false): Promise<GroupRecord | GroupWithMembers> {
	const group = await db.Group.findOne({
		where: { code: code.toUpperCase() },
		...(includeMembers ? { include: { association: 'members' } } : {}),
	})
	if (!group) throw new UserInputError('No such group.')
	if (includeMembers && !hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
	return group
}

const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789'.split('')
export function createRandomCode(): string {
	return integerRange(1, 4).map(() => sample(ALPHABET)).join('')
}
