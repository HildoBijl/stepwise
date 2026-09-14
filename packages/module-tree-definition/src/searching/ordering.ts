import { sortBy } from '@step-wise/js-utils'

import type { ModuleId, ModuleTree } from '../creation/index.ts'

import type { ModuleSearchOptions } from './types.ts'
import { ensureModuleIds } from './validation.ts'

// Sort a list of module IDs based on their order in the module tree, optionally filtering out concepts.
export function sortModuleIdsByTreeOrder(moduleTree: ModuleTree, moduleIds: readonly ModuleId[], { includeConcepts = true }: ModuleSearchOptions = {}): ModuleId[] {
	const ensuredModuleIds = ensureModuleIds(moduleTree, moduleIds).filter(moduleId => includeConcepts || moduleTree[moduleId].type === 'skill')
	const moduleOrder = new Map(Object.keys(moduleTree).map((moduleId, index) => [moduleId, index]))
	return sortBy(ensuredModuleIds, ensuredModuleIds.map(moduleId => moduleOrder.get(moduleId)!))
}
