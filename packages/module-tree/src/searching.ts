import * as agnostic from '@step-wise/module-tree-definition'

import { moduleTree } from './moduleTree.ts'

export type { EnsureModuleIdOptions, ExpandModuleIdsOptions, GetRequiredModuleIdsOptions, ModuleId, ModuleTree, SkillId } from '@step-wise/module-tree-definition'

export function ensureModuleId(moduleId: agnostic.ModuleId, options: agnostic.EnsureModuleIdOptions = {}): agnostic.ModuleId {
	return agnostic.ensureModuleId(moduleTree, moduleId, options)
}

export function ensureModuleIds(moduleIds: readonly agnostic.ModuleId[], options: agnostic.EnsureModuleIdOptions = {}): agnostic.ModuleId[] {
	return agnostic.ensureModuleIds(moduleTree, moduleIds, options)
}

export function ensureSkillId(skillId: agnostic.SkillId, options: agnostic.EnsureModuleIdOptions = {}): agnostic.SkillId {
	return agnostic.ensureSkillId(moduleTree, skillId, options)
}

export function ensureSkillIds(skillIds: readonly agnostic.SkillId[], options: agnostic.EnsureModuleIdOptions = {}): agnostic.SkillId[] {
	return agnostic.ensureSkillIds(moduleTree, skillIds, options)
}

export function expandModuleIdsWithDirectPrerequisites(moduleIds: readonly agnostic.ModuleId[], options: agnostic.ExpandModuleIdsOptions = {}): agnostic.ModuleId[] {
	return agnostic.expandModuleIdsWithDirectPrerequisites(moduleTree, moduleIds, options)
}

export function getRequiredModuleIds(moduleIds: readonly agnostic.ModuleId[], options: agnostic.GetRequiredModuleIdsOptions = {}): agnostic.ModuleId[] {
	return agnostic.getRequiredModuleIds(moduleTree, moduleIds, options)
}

export function isModuleRequiredFor(requiredModuleId: agnostic.ModuleId, moduleId: agnostic.ModuleId): boolean {
	return agnostic.isModuleRequiredFor(moduleTree, requiredModuleId, moduleId)
}

export function sortModuleIdsByTreeOrder(moduleIds: readonly agnostic.ModuleId[]): agnostic.ModuleId[] {
	return agnostic.sortModuleIdsByTreeOrder(moduleTree, moduleIds)
}
