import { type EnsureModuleIdOptions, type Module, type ModuleId, type Skill, type SkillId, createModuleTree, ensureModuleId, ensureSkillId } from '@step-wise/module-tree-definition'

import { moduleTreeDefinition } from './definitions/index.ts'

export const moduleTree = createModuleTree(moduleTreeDefinition)

export function getModule(moduleId: ModuleId, options: EnsureModuleIdOptions = {}): Module {
	return moduleTree[ensureModuleId(moduleTree, moduleId, options)]
}

export function getSkill(skillId: SkillId, options: EnsureModuleIdOptions = {}): Skill {
	return moduleTree[ensureSkillId(moduleTree, skillId, options)]
}
