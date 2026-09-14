import type { ModuleId, ModuleTree, SkillId } from '../creation/index.ts'

import type { ModuleSearchOptions } from './types.ts'
import { ensureModuleIds, ensureSkillIds, getSkill } from './validation.ts'

// Check if a module is a prerequisite of another module, optionally filtering out concepts.
export function isModulePrerequisiteOf(moduleTree: ModuleTree, prerequisiteId: ModuleId, moduleId: ModuleId, { includeConcepts = true }: ModuleSearchOptions = {}): boolean {
	const [ensuredPrerequisiteId, ensuredModuleId] = ensureModuleIds(moduleTree, [prerequisiteId, moduleId])
	if (!includeConcepts && (moduleTree[ensuredPrerequisiteId].type === 'concept' || moduleTree[ensuredModuleId].type === 'concept')) return false
	const visited = new Set<ModuleId>()
	const searchPrerequisites = (currentModuleId: ModuleId): boolean => {
		if (ensuredPrerequisiteId === currentModuleId) return true
		if (visited.has(currentModuleId)) return false
		visited.add(currentModuleId)
		return moduleTree[currentModuleId].prerequisiteIds.some(currentPrerequisiteId => includeConcepts || moduleTree[currentPrerequisiteId].type === 'skill' ? searchPrerequisites(currentPrerequisiteId) : false)
	}
	return searchPrerequisites(ensuredModuleId)
}

// From a list of module IDs, add all modules that are direct prerequisites of the respective modules.
export function expandModuleIdsWithDirectPrerequisites(moduleTree: ModuleTree, moduleIds: readonly ModuleId[], { includeConcepts = true }: ModuleSearchOptions = {}): ModuleId[] {
	const result = new Set<ModuleId>()
	for (const moduleId of ensureModuleIds(moduleTree, moduleIds)) {
		if (!includeConcepts && moduleTree[moduleId].type === 'concept') continue
		result.add(moduleId)
		for (const prerequisiteId of moduleTree[moduleId].prerequisiteIds) {
			if (includeConcepts || moduleTree[prerequisiteId].type === 'skill') result.add(prerequisiteId)
		}
	}
	return [...result]
}

// From a list of skill IDs, add all skills that are direct prerequisites and/or direct links of the respective skills.
export function expandSkillIdsWithDirectPrerequisitesAndLinks(moduleTree: ModuleTree, skillIds: readonly SkillId[]): SkillId[] {
	const result = new Set<SkillId>()
	for (const skillId of ensureSkillIds(moduleTree, skillIds)) {
		const skill = getSkill(moduleTree, skillId)
		result.add(skillId)
		for (const prerequisiteId of skill.prerequisiteIds) {
			if (moduleTree[prerequisiteId].type === 'skill') result.add(prerequisiteId as SkillId)
		}
		for (const linkedSkillId of skill.linkedSkillIds) result.add(linkedSkillId)
	}
	return [...result]
}

// Find all module IDs of the modules that are required for the given goals, but are not part of and/or covered by the given prior knowledge.
export function getModuleIdsBetweenGoalsAndPriorKnowledge(moduleTree: ModuleTree, goals: ModuleId[], priorKnowledge: ModuleId[], { includeConcepts = true }: ModuleSearchOptions = {}): ModuleId[] {
	goals = ensureModuleIds(moduleTree, goals)
	priorKnowledge = ensureModuleIds(moduleTree, priorKnowledge)
	const contents: ModuleId[] = []
	const processModule = (moduleId: ModuleId) => {
		if (!includeConcepts && moduleTree[moduleId].type === 'concept') return
		if (priorKnowledge.includes(moduleId) || contents.includes(moduleId)) return
		contents.push(moduleId)
		moduleTree[moduleId].prerequisiteIds.forEach(processModule)
	}
	goals.forEach(processModule)
	return contents
}
