import { UserInputError } from 'apollo-server-express'
import { integerRange, sample } from '@step-wise/utils'

export const GROUP_EVENTS = { groupUpdated: 'GROUP_UPDATED' } as const

export async function getUserWithGroups(db: any, userId: string) {
	const user = await db.User.findByPk(userId, { include: { association: 'groups', include: { association: 'members' } } })
	if (!user) throw new Error(`Failed to load the user with ID "${userId}".`)
	return user
}

export async function getUserGroups(db: any, userId: string) {
	const groups = (await getUserWithGroups(db, userId)).groups
	if (!groups) throw new Error(`Failed to load groups of user with ID "${userId}".`)
	return groups
}

export async function deactivateUserGroups(pubsub: any, user: any, exceptionCode?: string) {
	return Promise.all(user.groups.map(async (group: any) => {
		if (exceptionCode && group.code === exceptionCode) return group
		const member = group.members.find((candidate: any) => candidate.id === user.id)
		const membership = member.groupMembership
		if (!membership?.active) return group
		member.groupMembership = await membership.update({ active: false })
		await pubsub.publish(GROUP_EVENTS.groupUpdated, { updatedGroup: group, userId: user.id, action: 'deactivate' })
		return group
	}))
}

export async function getUserWithDeactivatedGroups(db: any, pubsub: any, userId: string, exceptionCode?: string) {
	const user = await getUserWithGroups(db, userId)
	user.groups = await deactivateUserGroups(pubsub, user, exceptionCode)
	return user
}

export async function getGroup(db: any, code: string) {
	const group = await db.Group.findOne({ where: { code: code.toUpperCase() }, include: { association: 'members' } })
	if (!group) throw new UserInputError('No such group.')
	return group
}

const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ2346789'.split('')
export function createRandomCode() {
	return integerRange(1, 4).map(() => sample(ALPHABET)).join('')
}
