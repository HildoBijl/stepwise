import { ensureSkillId, ensureSkillIds } from '@step-wise/skill-tree'

import { getSubscription } from '../subscriptions.ts'
import { type AuthenticatedContext, type UserRecord, getUser } from '../user/index.ts'

import type { UserSkillRecord } from './model.ts'
import { skillEvents } from './service.ts'
import { loadVisibleSkills, type SkillAccessContext } from './skillAccess.ts'

type SkillContext = SkillAccessContext & Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn'>

interface SkillsUpdatedPayload {
	userId: string
	updatedSkills: UserSkillRecord[]
}

async function userSkills(user: UserRecord, { ids }: { ids?: string[] }, context: SkillContext) {
	return loadVisibleSkills(user.id, ids ? ensureSkillIds(ids) : undefined, context)
}

export const skillResolvers = {
	UserPrivate: { skills: userSkills },
	UserFull: { skills: userSkills },

	Query: {
		skill: async (_source: unknown, args: { skillId: string; userId?: string }, context: SkillContext) => {
			context.ensureLoggedIn()
			const skillId = ensureSkillId(args.skillId)
			const userId = args.userId ?? context.userId
			if (userId !== context.userId) await getUser(context.db, userId)
			return (await loadVisibleSkills(userId, [skillId], context, true))[0] ?? null
		},
		skills: async (_source: unknown, { skillIds }: { skillIds?: string[] }, context: SkillContext) => {
			context.ensureLoggedIn()
			return loadVisibleSkills(context.userId, skillIds ? ensureSkillIds(skillIds) : undefined, context)
		},
	},

	Subscription: {
		...getSubscription('skillsUpdate', [skillEvents.skillsUpdated], ({ updatedSkills, userId }: SkillsUpdatedPayload, _args: unknown, context: SkillContext) => userId === context.userId ? updatedSkills : undefined),
	},
}
