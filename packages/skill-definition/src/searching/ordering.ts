import { sortBy } from '@step-wise/js-utils'

import type { ModuleId, ModuleTree, SkillId } from '../creation/index.ts'

import { ensureModuleIds, ensureSkillIds } from './validation.ts'

export function sortModuleIdsByTreeOrder(moduleTree: ModuleTree, moduleIds: readonly ModuleId[]): ModuleId[] {
	const ensuredModuleIds = ensureModuleIds(moduleTree, moduleIds)
	const moduleOrder = new Map(Object.keys(moduleTree).map((moduleId, index) => [moduleId, index]))
	return sortBy(ensuredModuleIds, ensuredModuleIds.map(moduleId => moduleOrder.get(moduleId)!))
}

export function sortSkillIdsByTreeOrder(moduleTree: ModuleTree, skillIds: readonly SkillId[]): SkillId[] {
	return sortModuleIdsByTreeOrder(moduleTree, ensureSkillIds(moduleTree, skillIds)) as SkillId[]
}
