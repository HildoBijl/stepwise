import { ensureSkillId, ensureSkillIds } from '@step-wise/skill-tree'

import { getSubscription } from '../subscriptions.js'
import { type UserRecord, getUser } from '../user/index.js'

import { type SkillDatabase, skillEvents } from './service.js'
import { loadVisibleSkills, type SkillAccessContext } from './skillAccess.js'

interface SkillContext extends SkillAccessContext {
	db: SkillDatabase
	ensureLoggedIn(): void
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
		...getSubscription('skillsUpdate', [skillEvents.skillsUpdated], ({ updatedSkills, userId }: any, _args: unknown, context: SkillContext) => userId === context.userId ? updatedSkills : undefined),
	},
}
