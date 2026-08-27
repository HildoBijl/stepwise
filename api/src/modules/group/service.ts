import type { PubSubEngine } from 'graphql-subscriptions'
import type { Transaction } from 'sequelize'

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

export function verifyGroupMembership(group: GroupWithMembers | null, userId: string): asserts group is GroupWithMembers {
	if (!group) throw new UserInputError('No group with the given code exists.')
	const member = group.members.find(candidate => candidate.id === userId)
	if (!member) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is not a member.`)
}

export function verifyGroupAccess(group: GroupWithMembers | null, userId: string): asserts group is GroupWithMembers {
	verifyGroupMembership(group, userId)
	const member = group.members.find(candidate => candidate.id === userId)
	if (!member) throw new Error(`Failed to find user "${userId}" among members of group "${group.code}".`)
	if (!member.groupMembership.active) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is currently not active in that group.`)
}

export async function getUserWithGroups(db: GroupDatabase, userId: string, onlyActive = false, transaction?: Transaction): Promise<UserWithGroups> {
	const user = await db.User.findByPk(userId, {
		...(transaction ? { transaction } : {}),
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

export async function deactivateUserGroups(user: UserWithGroups, exceptionCode?: string, transaction?: Transaction): Promise<GroupWithMembers[]> {
	const deactivatedGroups = await Promise.all(user.groups.map(async group => {
		if (exceptionCode && group.code === exceptionCode.toUpperCase()) return undefined
		const member = group.members.find(candidate => candidate.id === user.id)
		if (!member) throw new Error(`Failed to find user "${user.id}" among members of group "${group.code}".`)
		const membership = member.groupMembership
		if (!membership.active) return undefined
		member.groupMembership = await membership.update({ active: false }, transaction ? { transaction } : {})
		return group
	}))
	return deactivatedGroups.filter(group => group !== undefined)
}

export async function publishDeactivatedGroups(pubsub: PubSubEngine, groups: GroupWithMembers[], userId: string): Promise<void> {
	await Promise.all(groups.map(async updatedGroup => await pubsub.publish(groupEvents.groupUpdated, { updatedGroup, userId, action: 'deactivate' })))
}

export function getGroup(db: GroupDatabase, code: string, includeMembers: true, transaction?: Transaction): Promise<GroupWithMembers>
export function getGroup(db: GroupDatabase, code: string, includeMembers?: false, transaction?: Transaction): Promise<GroupRecord>
export async function getGroup(db: GroupDatabase, code: string, includeMembers = false, transaction?: Transaction): Promise<GroupRecord | GroupWithMembers> {
	const group = await db.Group.findOne({
		...(transaction ? { transaction } : {}),
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
