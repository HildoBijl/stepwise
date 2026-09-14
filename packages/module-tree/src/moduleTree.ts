import { type EnsureModuleIdOptions, type Module, type ModuleId, type Skill, type SkillId, createModuleTree, getModule as getModuleFromTree, getSkill as getSkillFromTree } from '@step-wise/module-tree-definition'

import { moduleTreeDefinition } from './definitions/index.ts'

export const moduleTree = createModuleTree(moduleTreeDefinition)

export function getModule(moduleId: ModuleId, options: EnsureModuleIdOptions = {}): Module {
	return getModuleFromTree(moduleTree, moduleId, options)
}

export function getSkill(skillId: SkillId, options: EnsureModuleIdOptions = {}): Skill {
	return getSkillFromTree(moduleTree, skillId, options)
}
