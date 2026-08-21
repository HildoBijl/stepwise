import { sortBy } from '@step-wise/js-utils'

import type { SkillId, SkillTree } from '../creation'

import { ensureSkillIds } from './checks'

// Check if the given child skill is a prerequisite for the given parent skill.
export function isSkillRequiredFor(skillTree: SkillTree, childId: SkillId, parentId: SkillId): boolean {
	const [ensuredChildId, ensuredParentId] = ensureSkillIds(skillTree, [childId, parentId])
	const visited = new Set<SkillId>()
	const searchPrerequisites = (currentSkillId: SkillId): boolean => {
		if (ensuredChildId === currentSkillId) return true
		if (visited.has(currentSkillId)) return false
		visited.add(currentSkillId)
		return skillTree[currentSkillId].prerequisites.some(searchPrerequisites)
	}
	return searchPrerequisites(ensuredParentId)
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

// Return all skills between the given goals and prior knowledge. The goals are included; the prior knowledge is excluded.
export function getRequiredSkills(skillTree: SkillTree, goals: SkillId[], priorKnowledge: SkillId[]): SkillId[] {
	goals = ensureSkillIds(skillTree, goals)
	priorKnowledge = ensureSkillIds(skillTree, priorKnowledge)
	const contents: SkillId[] = []
	const processSkill = (skillId: SkillId) => {
		if (priorKnowledge.includes(skillId) || contents.includes(skillId)) return
		contents.push(skillId)
		skillTree[skillId].prerequisites.forEach(skillId => processSkill(skillId))
	}
	goals.forEach(goalId => processSkill(goalId))
	return contents
}

// Sort a given list of skills by the order defined by the Skill Tree.
export function sortBySkillTreeOrder(skillTree: SkillTree, skillIds: readonly SkillId[]): SkillId[] {
	const ensuredSkillIds = ensureSkillIds(skillTree, skillIds)
	const skillOrder = new Map(Object.keys(skillTree).map((skillId, index) => [skillId, index]))
	return sortBy(ensuredSkillIds, ensuredSkillIds.map(skillId => skillOrder.get(skillId)!))
}
