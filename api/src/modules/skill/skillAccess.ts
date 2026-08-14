import { AuthenticationError } from '../../errors.ts'

import type { UserSkillRecord } from './model.ts'

export interface SkillAccessContext {
	loaders: any
	userId: string
	isAdmin: boolean
}

export async function loadVisibleSkills(targetUserId: string, skillIds: string[] | undefined, context: SkillAccessContext, rejectInaccessible = false): Promise<UserSkillRecord[]> {
	const mayViewAll = targetUserId === context.userId || context.isAdmin
	let filteredSkillIds = skillIds
	let skillIdsWithExercisePermission: Set<string> | undefined

	// Run permission checks and note for each skill whether exercises may be viewed.
	if (!mayViewAll) {
		const { withExercises, withoutExercises } = await context.loaders.permittedSkillsForStudent.load(targetUserId)
		if (skillIds && rejectInaccessible) {
			const inaccessibleSkillId = skillIds.find(skillId => !withoutExercises.includes(skillId))
			if (inaccessibleSkillId) throw new AuthenticationError(`Invalid skill request: the current user is not allowed to access skill "${inaccessibleSkillId}" of the user with ID "${targetUserId}".`)
		}
		filteredSkillIds = skillIds ? skillIds.filter(skillId => withoutExercises.includes(skillId)) : withoutExercises
		skillIdsWithExercisePermission = new Set(withExercises)
	}

	// Load the skills, and note the respective permissions.
	const skills: UserSkillRecord[] = filteredSkillIds
		? (await context.loaders.skillForUser.loadMany(filteredSkillIds.map(skillId => ({ userId: targetUserId, skillId })))).filter(Boolean)
		: await context.loaders.allSkillsForUser.load(targetUserId)
	skills.forEach(skill => { skill.mayViewExercises = mayViewAll || skillIdsWithExercisePermission!.has(skill.skillId) })
	return skills
}
