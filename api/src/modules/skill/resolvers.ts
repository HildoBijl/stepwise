import { AuthenticationError } from 'apollo-server-express'
import { ensureSkillId, ensureSkillIds } from '@step-wise/skill-tree'

import { getSubscription } from '../subscriptions'
import { getUser, type UserRecord } from '../user'
import { getUserSkill, getUserSkills, SKILL_EVENTS, type SkillDatabase } from './service'
import type { UserSkillRecord } from './model'

interface SkillContext {
	db: SkillDatabase & { User: any }
	loaders: any
	userId: string
	isAdmin: boolean
	ensureLoggedIn(): void
}

async function userSkills(user: UserRecord, { ids: skillIds }: { ids?: string[] }, { loaders, userId, isAdmin }: SkillContext) {
	if (skillIds) skillIds = ensureSkillIds(skillIds)
	const mayLoadAll = user.id === userId || isAdmin

	if (!skillIds && mayLoadAll) {
		const skills: UserSkillRecord[] = await loaders.allSkillsForUser.load(user.id)
		skills.forEach(skill => { skill.allowExercises = true })
		return skills
	}
	if (mayLoadAll) {
		const skills: UserSkillRecord[] = (await loaders.skillForUser.loadMany(skillIds!.map(skillId => ({ userId: user.id, skillId })))).filter(Boolean)
		skills.forEach(skill => { skill.allowExercises = true })
		return skills
	}

	const { withExercises, withoutExercises } = await loaders.permittedSkillsForStudent.load(user.id)
	skillIds = skillIds ? skillIds.filter(skillId => withoutExercises.includes(skillId)) : withoutExercises
	const selectedSkillIds = skillIds ?? []
	const skills: UserSkillRecord[] = (await loaders.skillForUser.loadMany(selectedSkillIds.map(skillId => ({ userId: user.id, skillId })))).filter(Boolean)
	skills.forEach(skill => { skill.allowExercises = withExercises.includes(skill.skillId) })
	return skills
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

			if (userId === context.userId || context.isAdmin) {
				const skill = await getUserSkill(context.db, userId, skillId)
				if (skill) skill.allowExercises = true
				return skill
			}

			const { withExercises, withoutExercises } = await context.loaders.permittedSkillsForStudent.load(userId)
			if (!withoutExercises.includes(skillId)) throw new AuthenticationError(`Invalid skill request: the current user is not allowed to access skill "${skillId}" of the user with ID "${userId}".`)
			const skill = await getUserSkill(context.db, userId, skillId)
			if (skill) skill.allowExercises = withExercises.includes(skillId)
			return skill
		},
		skills: async (_source: unknown, { skillIds }: { skillIds?: string[] }, context: SkillContext) => {
			context.ensureLoggedIn()
			return getUserSkills(context.db, context.userId, skillIds ? ensureSkillIds(skillIds) : undefined)
		},
	},
	Subscription: {
		...getSubscription('skillsUpdate', [SKILL_EVENTS.skillsUpdated], ({ updatedSkills, userId }: any, _args: unknown, context: SkillContext) =>
			userId === context.userId ? updatedSkills : undefined),
	},
}
