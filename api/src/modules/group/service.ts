import type { PubSubEngine } from 'graphql-subscriptions'

import { integerRange, sample } from '@step-wise/js-utils'

import { ForbiddenError, InvalidInputError } from '../../errors.ts'

import type { LockingServiceOptions, ServiceOptions } from '../types.ts'
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

export function ensureGroupMembership(group: GroupWithMembers | null, userId: string): asserts group is GroupWithMembers {
	if (!group) throw new InvalidInputError('No group with the given code exists.')
	const member = group.members.find(candidate => candidate.id === userId)
	if (!member) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is not a member.`)
}

export function ensureActiveGroupMembership(group: GroupWithMembers | null, userId: string): asserts group is GroupWithMembers {
	ensureGroupMembership(group, userId)
	const member = group.members.find(candidate => candidate.id === userId)
	if (!member) throw new Error(`Failed to find user "${userId}" among members of group "${group.code}".`)
	if (!member.groupMembership.active) throw new ForbiddenError(`Access to group "${group.code}" is not allowed: the user is currently not active in that group.`)
}

export interface GetUserGroupsOptions extends ServiceOptions {
	onlyActive?: boolean
}

export async function getUserWithGroups(db: GroupDatabase, userId: string, { onlyActive = false, transaction }: GetUserGroupsOptions = {}): Promise<UserWithGroups> {
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

export async function getUserGroups(db: GroupDatabase, userId: string, options: GetUserGroupsOptions = {}): Promise<GroupWithMembers[]> {
	return (await getUserWithGroups(db, userId, options)).groups
}

export interface DeactivateGroupMembershipsOptions extends ServiceOptions {
	exceptionCode?: string
}

export async function deactivateUserGroupMemberships(user: UserWithGroups, { exceptionCode, transaction }: DeactivateGroupMembershipsOptions = {}): Promise<GroupWithMembers[]> {
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

export async function publishDeactivatedGroupMemberships(pubsub: PubSubEngine, groups: GroupWithMembers[], userId: string): Promise<void> {
	await Promise.all(groups.map(async updatedGroup => await pubsub.publish(groupEvents.groupUpdated, { updatedGroup, userId, action: 'deactivate' })))
}

export interface GetGroupOptions extends LockingServiceOptions {
	includeMembers?: boolean
}

export function getGroup(db: GroupDatabase, code: string, options: GetGroupOptions & { includeMembers: true }): Promise<GroupWithMembers>
export function getGroup(db: GroupDatabase, code: string, options?: GetGroupOptions & { includeMembers?: false }): Promise<GroupRecord>
export async function getGroup(db: GroupDatabase, code: string, { includeMembers = false, transaction, lock }: GetGroupOptions = {}): Promise<GroupRecord | GroupWithMembers> {
	const group = await db.Group.findOne({
		...(transaction ? { transaction } : {}),
		...(lock ? { lock } : {}),
		where: { code: code.toUpperCase() },
		...(includeMembers ? { include: { association: 'members' } } : {}),
	})
	if (!group) throw new InvalidInputError('No such group.')
	if (includeMembers && !hasLoadedGroupMembers(group)) throw new Error(`Failed to load members of group "${group.code}".`)
	return group
}

const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789'.split('')
export function createRandomGroupCode(): string {
	return integerRange(1, 4).map(() => sample(ALPHABET)).join('')
}
