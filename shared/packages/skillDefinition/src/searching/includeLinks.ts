import type { SkillId, SkillTree } from '../creation'

import { ensureSkillIds } from './checks'

// Find the prerequisites of all the given skillIds.
export function includeDirectPrerequisites(skillTree: SkillTree, skillIds: SkillId | SkillId[]): SkillId[] {
	const result = new Set<SkillId>()
	for (const skillId of ensureSkillIds(skillTree, skillIds)) {
		result.add(skillId)
		for (const prerequisite of skillTree[skillId].prerequisites) result.add(prerequisite)
	}
	return [...result]
}

// Find the prerequisites and linked skills of all the given skillIds.
export function includeDirectPrerequisitesAndLinks(skillTree: SkillTree, skillIds: SkillId | SkillId[]): SkillId[] {
	const result = new Set<SkillId>()
	for (const skillId of ensureSkillIds(skillTree, skillIds)) {
		result.add(skillId)
		for (const prerequisite of skillTree[skillId].prerequisites) result.add(prerequisite)
		for (const linkedSkill of skillTree[skillId].linkedSkills) result.add(linkedSkill)
	}
	return [...result]
}
