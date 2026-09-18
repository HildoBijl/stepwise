import type { ModuleId, ModuleTree } from '../creation/index.ts'

import { ensureModuleIds } from './validation.ts'

export type ExpandModuleIdsOptions = {
	includeConcepts?: boolean
	includeLinkedSkills?: boolean
}

export type GetRequiredModuleIdsOptions = {
	priorKnowledgeIds?: readonly ModuleId[]
	includeConcepts?: boolean
}

// Check if a module is required for another module. A module is considered required for itself.
export function isModuleRequiredFor(moduleTree: ModuleTree, requiredModuleId: ModuleId, moduleId: ModuleId): boolean {
	const [ensuredRequiredModuleId, ensuredModuleId] = ensureModuleIds(moduleTree, [requiredModuleId, moduleId])
	const visited = new Set<ModuleId>()
	const searchPrerequisites = (currentModuleId: ModuleId): boolean => {
		if (ensuredRequiredModuleId === currentModuleId) return true
		if (visited.has(currentModuleId)) return false
		visited.add(currentModuleId)
		return moduleTree[currentModuleId].prerequisiteIds.some(searchPrerequisites)
	}
	return searchPrerequisites(ensuredModuleId)
}

// Add the direct prerequisites and, when requested, links of the supplied modules.
export function expandModuleIdsWithDirectPrerequisites(moduleTree: ModuleTree, moduleIds: readonly ModuleId[], { includeConcepts = true, includeLinkedSkills = false }: ExpandModuleIdsOptions = {}): ModuleId[] {
	const result = new Set<ModuleId>()
	for (const moduleId of ensureModuleIds(moduleTree, moduleIds)) {
		const module = moduleTree[moduleId]
		if (!includeConcepts && module.type === 'concept') continue
		result.add(moduleId)
		for (const prerequisiteId of module.prerequisiteIds) {
			if (includeConcepts || moduleTree[prerequisiteId].type === 'skill') result.add(prerequisiteId)
		}
		if (includeLinkedSkills && module.type === 'skill') module.linkedSkillIds.forEach(linkedSkillId => result.add(linkedSkillId))
	}
	return [...result]
}

// Find the modules required for the supplied modules, stopping at the prior-knowledge boundary.
export function getRequiredModuleIds(moduleTree: ModuleTree, moduleIds: readonly ModuleId[], { priorKnowledgeIds = [], includeConcepts = true }: GetRequiredModuleIdsOptions = {}): ModuleId[] {
	const ensuredModuleIds = ensureModuleIds(moduleTree, moduleIds)
	const ensuredPriorKnowledgeIds = ensureModuleIds(moduleTree, priorKnowledgeIds)
	const requiredModuleIds: ModuleId[] = []
	const processModule = (moduleId: ModuleId) => {
		if (!includeConcepts && moduleTree[moduleId].type === 'concept') return
		if (ensuredPriorKnowledgeIds.includes(moduleId) || requiredModuleIds.includes(moduleId)) return
		requiredModuleIds.push(moduleId)
		moduleTree[moduleId].prerequisiteIds.forEach(processModule)
	}
	ensuredModuleIds.forEach(processModule)
	return requiredModuleIds
}
