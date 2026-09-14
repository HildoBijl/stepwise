import * as agnostic from '@step-wise/module-tree-definition'

import { moduleTree } from './moduleTree.ts'

export type { EnsureModuleIdOptions, ModuleId, ModuleTree, SkillId } from '@step-wise/module-tree-definition'

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

export function expandModuleIdsWithDirectPrerequisites(moduleIds: readonly agnostic.ModuleId[]): agnostic.ModuleId[] {
	return agnostic.expandModuleIdsWithDirectPrerequisites(moduleTree, moduleIds)
}

export function expandSkillIdsWithDirectPrerequisites(skillIds: readonly agnostic.SkillId[]): agnostic.SkillId[] {
	return agnostic.expandSkillIdsWithDirectPrerequisites(moduleTree, skillIds)
}

export function expandSkillIdsWithDirectPrerequisitesAndLinks(skillIds: readonly agnostic.SkillId[]): agnostic.SkillId[] {
	return agnostic.expandSkillIdsWithDirectPrerequisitesAndLinks(moduleTree, skillIds)
}

export function getModuleIdsBetweenGoalsAndPriorKnowledge(goals: agnostic.ModuleId[], priorKnowledge: agnostic.ModuleId[]): agnostic.ModuleId[] {
	return agnostic.getModuleIdsBetweenGoalsAndPriorKnowledge(moduleTree, goals, priorKnowledge)
}

export function getSkillIdsBetweenGoalsAndPriorKnowledge(goals: agnostic.SkillId[], priorKnowledge: agnostic.SkillId[]): agnostic.SkillId[] {
	return agnostic.getSkillIdsBetweenGoalsAndPriorKnowledge(moduleTree, goals, priorKnowledge)
}

export function isModulePrerequisiteOf(prerequisiteId: agnostic.ModuleId, moduleId: agnostic.ModuleId): boolean {
	return agnostic.isModulePrerequisiteOf(moduleTree, prerequisiteId, moduleId)
}

export function isSkillPrerequisiteOf(prerequisiteId: agnostic.SkillId, skillId: agnostic.SkillId): boolean {
	return agnostic.isSkillPrerequisiteOf(moduleTree, prerequisiteId, skillId)
}

export function sortModuleIdsByTreeOrder(moduleIds: readonly agnostic.ModuleId[]): agnostic.ModuleId[] {
	return agnostic.sortModuleIdsByTreeOrder(moduleTree, moduleIds)
}

export function sortSkillIdsByTreeOrder(skillIds: readonly agnostic.SkillId[]): agnostic.SkillId[] {
	return agnostic.sortSkillIdsByTreeOrder(moduleTree, skillIds)
}
