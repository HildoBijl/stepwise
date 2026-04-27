import type { SkillId, SkillTree } from '../creation'

// Check if the given child skill is a prerequisite for the given parent skill.
export function isSkillRequiredFor(skillTree: SkillTree, childId: SkillId, parentId: SkillId, visited = new Set<SkillId>()): boolean {
	if (childId === parentId) return true
	if (visited.has(parentId)) return false
	visited.add(parentId)
	return skillTree[parentId].prerequisites.some(prerequisiteId => isSkillRequiredFor(skillTree, childId, prerequisiteId, visited)
	)
}
