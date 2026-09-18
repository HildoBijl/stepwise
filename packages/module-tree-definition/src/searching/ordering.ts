import { sortBy } from '@step-wise/js-utils'

import type { ModuleId, ModuleTree } from '../creation/index.ts'

import { ensureModuleIds } from './validation.ts'

// Sort a list of module IDs based on their order in the module tree.
export function sortModuleIdsByTreeOrder(moduleTree: ModuleTree, moduleIds: readonly ModuleId[]): ModuleId[] {
	const ensuredModuleIds = ensureModuleIds(moduleTree, moduleIds)
	const moduleOrder = new Map(Object.keys(moduleTree).map((moduleId, index) => [moduleId, index]))
	return sortBy(ensuredModuleIds, ensuredModuleIds.map(moduleId => moduleOrder.get(moduleId)!))
}
