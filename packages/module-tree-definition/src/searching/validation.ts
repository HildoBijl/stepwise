import { type SkillSetup, type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'

import type { Module, ModuleId, ModuleTree, Skill, SkillId } from '../creation/index.ts'

export type EnsureModuleIdOptions = {
	allowCaseInsensitiveMatch?: boolean
}

// Ensure that a module ID exists in the module tree, optionally allowing case-insensitive matching.
export function ensureModuleId(moduleTree: ModuleTree, moduleId: ModuleId, options: EnsureModuleIdOptions = {}): ModuleId {
	if (Object.hasOwn(moduleTree, moduleId)) return moduleId
	if (!options.allowCaseInsensitiveMatch) throw new Error(`Unknown module ID: "${moduleId}" is not known in the module tree.`)

	const moduleIdLower = moduleId.toLowerCase()
	const adjustedModuleId = Object.keys(moduleTree).find(id => id.toLowerCase() === moduleIdLower)
	if (adjustedModuleId) return adjustedModuleId
	throw new Error(`Unknown module ID: "${moduleId}" is not known in the module tree.`)
}

// Ensure that a list of module IDs exist in the module tree, optionally allowing case-insensitive matching.
export function ensureModuleIds(moduleTree: ModuleTree, moduleIds: readonly ModuleId[], options: EnsureModuleIdOptions = {}): ModuleId[] {
	return moduleIds.map(moduleId => ensureModuleId(moduleTree, moduleId, options))
}

// Get a module from the module tree by its ID, ensuring that it exists and optionally allowing case-insensitive matching.
export function getModule(moduleTree: ModuleTree, moduleId: ModuleId, options: EnsureModuleIdOptions = {}): Module {
	return moduleTree[ensureModuleId(moduleTree, moduleId, options)]
}

// Ensure that a skill ID exists in the module tree, optionally allowing case-insensitive matching.
export function ensureSkillId(moduleTree: ModuleTree, skillId: SkillId, options: EnsureModuleIdOptions = {}): SkillId {
	return getSkill(moduleTree, skillId, options).id
}

// Ensure that a list of skill IDs exist in the module tree, optionally allowing case-insensitive matching.
export function ensureSkillIds(moduleTree: ModuleTree, skillIds: readonly SkillId[], options: EnsureModuleIdOptions = {}): SkillId[] {
	return skillIds.map(skillId => ensureSkillId(moduleTree, skillId, options))
}

// Get a skill from the module tree by its ID, ensuring that it exists and is of type 'skill', optionally allowing case-insensitive matching.
export function getSkill(moduleTree: ModuleTree, skillId: SkillId, options: EnsureModuleIdOptions = {}): Skill {
	const module = getModule(moduleTree, skillId, options)
	if (module.type !== 'skill') throw new Error(`Invalid skill ID: "${skillId}" identifies a concept rather than a skill.`)
	return module
}

// Ensure that a SkillSetup is valid and that all skill IDs it references exist in the module tree.
export function ensureSkillSetup(moduleTree: ModuleTree, setup: SkillSetupLike): SkillSetup {
	const checkedSetup = ensureSetup(setup)
	ensureSkillIds(moduleTree, checkedSetup.getSkillList())
	return checkedSetup
}
