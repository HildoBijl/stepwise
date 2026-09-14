import type { ModuleId, ModuleTree, Skill, SkillId } from '../creation/index.ts'

import { ensureModuleIds, ensureSkillIds } from './validation.ts'

export function isModulePrerequisiteOf(moduleTree: ModuleTree, prerequisiteId: ModuleId, moduleId: ModuleId): boolean {
	const [ensuredPrerequisiteId, ensuredModuleId] = ensureModuleIds(moduleTree, [prerequisiteId, moduleId])
	const visited = new Set<ModuleId>()
	const searchPrerequisites = (currentModuleId: ModuleId): boolean => {
		if (ensuredPrerequisiteId === currentModuleId) return true
		if (visited.has(currentModuleId)) return false
		visited.add(currentModuleId)
		return moduleTree[currentModuleId].prerequisiteIds.some(searchPrerequisites)
	}
	return searchPrerequisites(ensuredModuleId)
}

export function isSkillPrerequisiteOf(moduleTree: ModuleTree, prerequisiteId: SkillId, skillId: SkillId): boolean {
	const [ensuredPrerequisiteId, ensuredSkillId] = ensureSkillIds(moduleTree, [prerequisiteId, skillId])
	return isModulePrerequisiteOf(moduleTree, ensuredPrerequisiteId, ensuredSkillId)
}

export function expandModuleIdsWithDirectPrerequisites(moduleTree: ModuleTree, moduleIds: readonly ModuleId[]): ModuleId[] {
	const result = new Set<ModuleId>()
	for (const moduleId of ensureModuleIds(moduleTree, moduleIds)) {
		result.add(moduleId)
		for (const prerequisiteId of moduleTree[moduleId].prerequisiteIds) result.add(prerequisiteId)
	}
	return [...result]
}

export function expandSkillIdsWithDirectPrerequisites(moduleTree: ModuleTree, skillIds: readonly SkillId[]): SkillId[] {
	return expandModuleIdsWithDirectPrerequisites(moduleTree, ensureSkillIds(moduleTree, skillIds)).filter(moduleId => moduleTree[moduleId].type === 'skill') as SkillId[]
}

export function expandSkillIdsWithDirectPrerequisitesAndLinks(moduleTree: ModuleTree, skillIds: readonly SkillId[]): SkillId[] {
	const result = new Set<SkillId>()
	for (const skillId of ensureSkillIds(moduleTree, skillIds)) {
		const skill = moduleTree[skillId] as Skill
		result.add(skillId)
		for (const prerequisiteId of skill.prerequisiteIds) {
			if (moduleTree[prerequisiteId].type === 'skill') result.add(prerequisiteId as SkillId)
		}
		for (const linkedSkillId of skill.linkedSkillIds) result.add(linkedSkillId)
	}
	return [...result]
}

export function getModuleIdsBetweenGoalsAndPriorKnowledge(moduleTree: ModuleTree, goals: ModuleId[], priorKnowledge: ModuleId[]): ModuleId[] {
	goals = ensureModuleIds(moduleTree, goals)
	priorKnowledge = ensureModuleIds(moduleTree, priorKnowledge)
	const contents: ModuleId[] = []
	const processModule = (moduleId: ModuleId) => {
		if (priorKnowledge.includes(moduleId) || contents.includes(moduleId)) return
		contents.push(moduleId)
		moduleTree[moduleId].prerequisiteIds.forEach(processModule)
	}
	goals.forEach(processModule)
	return contents
}

export function getSkillIdsBetweenGoalsAndPriorKnowledge(moduleTree: ModuleTree, goals: SkillId[], priorKnowledge: SkillId[]): SkillId[] {
	const ensuredGoals = ensureSkillIds(moduleTree, goals)
	const ensuredPriorKnowledge = ensureSkillIds(moduleTree, priorKnowledge)
	return getModuleIdsBetweenGoalsAndPriorKnowledge(moduleTree, ensuredGoals, ensuredPriorKnowledge).filter(moduleId => moduleTree[moduleId].type === 'skill') as SkillId[]
}
