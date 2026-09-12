import { ForbiddenError, InvalidInputError } from '../../../errors.ts'

import { getGroup, getUserGroups } from '../service.ts'
import type { AuthenticatedGroupContext, GroupContext } from './types.ts'

export const groupQueryResolvers = {
	myGroups: async (_source: unknown, _args: unknown, { db, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
		ensureSignedIn()
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

	myActiveGroup: async (_source: unknown, _args: unknown, { db, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
		ensureSignedIn()
		return (await getUserGroups(db, userId, { onlyActive: true }))[0]
	},

	group: async (_source: unknown, { code }: { code: string }, { db, ensureSignedIn, userId }: AuthenticatedGroupContext) => {
		ensureSignedIn()
		const group = await getGroup(db, code, { includeMembers: true })
		const member = group.members.find(member => member.id === userId)
		if (!member) throw new ForbiddenError('Failed to load group data: only members have access.')
		return group
	},
}
