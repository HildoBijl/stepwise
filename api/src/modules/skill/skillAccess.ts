import type { SkillId } from '@step-wise/skill-definition'

import { ForbiddenError } from '../../errors.ts'

import type { AuthenticatedContext } from '../user/index.ts'

import type { UserSkillRecord } from './models.ts'

export type SkillAccessContext = Pick<AuthenticatedContext, 'loaders' | 'isAdmin' | 'userId'>

export async function loadVisibleSkills(targetUserId: string, skillIds: readonly SkillId[] | undefined, context: SkillAccessContext, rejectInaccessible = false): Promise<UserSkillRecord[]> {
	const mayViewAll = targetUserId === context.userId || context.isAdmin
	let filteredSkillIds = skillIds
	let skillIdsWithExercisePermission: Set<string> | undefined

	// Run permission checks and note for each skill whether exercises may be viewed.
	if (!mayViewAll) {
		const { withExercises, withoutExercises } = await context.loaders.permittedSkillsForStudent.load(targetUserId)
		if (skillIds && rejectInaccessible) {
			const inaccessibleSkillId = skillIds.find(skillId => !withoutExercises.includes(skillId))
			if (inaccessibleSkillId) throw new ForbiddenError(`Invalid skill request: the current user is not allowed to access skill "${inaccessibleSkillId}" of the user with ID "${targetUserId}".`)
		}
		filteredSkillIds = skillIds ? skillIds.filter(skillId => withoutExercises.includes(skillId)) : withoutExercises
		skillIdsWithExercisePermission = new Set(withExercises)
	}

	// Load the skills, and note the respective permissions.
	const loadedSkills = filteredSkillIds
		? await context.loaders.skillForUser.loadMany(filteredSkillIds.map(skillId => ({ userId: targetUserId, skillId })))
		: await context.loaders.allSkillsForUser.load(targetUserId)
	const skills = loadedSkills
		.map(skill => {
			if (skill instanceof Error) throw skill
			return skill
		})
		.filter((skill): skill is UserSkillRecord => skill !== null)
	skills.forEach(skill => { skill.mayViewExercises = mayViewAll || skillIdsWithExercisePermission?.has(skill.skillId) === true })
	return skills
}
