import type { SkillId, SkillTree } from '../creation'

import { ensureSkillIds } from './checks'

// Check if the given child skill is a prerequisite for the given parent skill.
export function isSkillRequiredFor(skillTree: SkillTree, childId: SkillId, parentId: SkillId, visited = new Set<SkillId>()): boolean {
	if (childId === parentId) return true
	if (visited.has(parentId)) return false
	visited.add(parentId)
	return skillTree[parentId].prerequisites.some(prerequisiteId => isSkillRequiredFor(skillTree, childId, prerequisiteId, visited)
	)
}

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
