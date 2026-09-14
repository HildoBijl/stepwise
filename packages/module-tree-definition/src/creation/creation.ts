import type { ModuleTree, ModuleTreeDefinition, SkillTree, SkillTreeDefinition } from './types.ts'
import { flattenModuleTreeDefinition } from './flattening.ts'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing.ts'
import { validateAndProcessLinks } from './linkProcessing.ts'

export function createModuleTree(moduleTreeDefinition: SkillTreeDefinition): SkillTree
export function createModuleTree(moduleTreeDefinition: ModuleTreeDefinition): ModuleTree
export function createModuleTree(moduleTreeDefinition: ModuleTreeDefinition): ModuleTree {
	const moduleTree = flattenModuleTreeDefinition(moduleTreeDefinition)
	validateAndProcessPrerequisites(moduleTree)
	validateAndProcessLinks(moduleTree)
	return moduleTree
}
