import type { SkillId, SkillTree } from '../creation/index.ts'

import { ensureSkillIds } from './validation.ts'

// Check if the given child skill is a prerequisite for the given parent skill.
export function isSkillPrerequisiteOf(skillTree: SkillTree, prerequisiteId: SkillId, skillId: SkillId): boolean {
	const [ensuredPrerequisiteId, ensuredSkillId] = ensureSkillIds(skillTree, [prerequisiteId, skillId])
	const visited = new Set<SkillId>()
	const searchPrerequisites = (currentSkillId: SkillId): boolean => {
		if (ensuredPrerequisiteId === currentSkillId) return true
		if (visited.has(currentSkillId)) return false
		visited.add(currentSkillId)
		return skillTree[currentSkillId].prerequisiteIds.some(searchPrerequisites)
	}
	return searchPrerequisites(ensuredSkillId)
}

// Find the prerequisites of all the given skillIds.
export function expandSkillIdsWithDirectPrerequisites(skillTree: SkillTree, skillIds: readonly SkillId[]): SkillId[] {
	const result = new Set<SkillId>()
	for (const skillId of ensureSkillIds(skillTree, skillIds)) {
		result.add(skillId)
		for (const prerequisiteId of skillTree[skillId].prerequisiteIds) result.add(prerequisiteId)
	}
	return [...result]
}

// Find the prerequisites and linked skills of all the given skillIds.
export function expandSkillIdsWithDirectPrerequisitesAndLinks(skillTree: SkillTree, skillIds: readonly SkillId[]): SkillId[] {
	const result = new Set<SkillId>()
	for (const skillId of ensureSkillIds(skillTree, skillIds)) {
		result.add(skillId)
		for (const prerequisiteId of skillTree[skillId].prerequisiteIds) result.add(prerequisiteId)
		for (const linkedSkillId of skillTree[skillId].linkedSkillIds) result.add(linkedSkillId)
	}
	return [...result]
}

// Return all skills between the given goals and prior knowledge. The goals are included; the prior knowledge is excluded.
export function getSkillIdsBetweenGoalsAndPriorKnowledge(skillTree: SkillTree, goals: SkillId[], priorKnowledge: SkillId[]): SkillId[] {
	goals = ensureSkillIds(skillTree, goals)
	priorKnowledge = ensureSkillIds(skillTree, priorKnowledge)
	const contents: SkillId[] = []
	const processSkill = (skillId: SkillId) => {
		if (priorKnowledge.includes(skillId) || contents.includes(skillId)) return
		contents.push(skillId)
		skillTree[skillId].prerequisiteIds.forEach(prerequisiteId => processSkill(prerequisiteId))
	}
	goals.forEach(goalId => processSkill(goalId))
	return contents
}
