import { type SkillSetup, type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'

import type { ModuleId, ModuleTree, SkillId } from '../creation/index.ts'

export type EnsureModuleIdOptions = {
	allowCaseInsensitiveMatch?: boolean
}

export function ensureModuleId(moduleTree: ModuleTree, moduleId: ModuleId, options: EnsureModuleIdOptions = {}): ModuleId {
	if (Object.hasOwn(moduleTree, moduleId)) return moduleId
	if (!options.allowCaseInsensitiveMatch) throw new Error(`Unknown module ID: "${moduleId}" is not known in the module tree.`)

	const moduleIdLower = moduleId.toLowerCase()
	const adjustedModuleId = Object.keys(moduleTree).find(id => id.toLowerCase() === moduleIdLower)
	if (adjustedModuleId) return adjustedModuleId
	throw new Error(`Unknown module ID: "${moduleId}" is not known in the module tree.`)
}

export function ensureModuleIds(moduleTree: ModuleTree, moduleIds: readonly ModuleId[], options: EnsureModuleIdOptions = {}): ModuleId[] {
	return moduleIds.map(moduleId => ensureModuleId(moduleTree, moduleId, options))
}

export function ensureSkillId(moduleTree: ModuleTree, skillId: SkillId, options: EnsureModuleIdOptions = {}): SkillId {
	const moduleId = ensureModuleId(moduleTree, skillId, options)
	if (moduleTree[moduleId].type !== 'skill') throw new Error(`Invalid skill ID: "${skillId}" identifies a concept rather than a skill.`)
	return moduleId as SkillId
}

export function ensureSkillIds(moduleTree: ModuleTree, skillIds: readonly SkillId[], options: EnsureModuleIdOptions = {}): SkillId[] {
	return skillIds.map(skillId => ensureSkillId(moduleTree, skillId, options))
}

export function ensureSkillSetup(moduleTree: ModuleTree, setup: SkillSetupLike): SkillSetup {
	const checkedSetup = ensureSetup(setup)
	ensureSkillIds(moduleTree, checkedSetup.getSkillList())
	return checkedSetup
}
