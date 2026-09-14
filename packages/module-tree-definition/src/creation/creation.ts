import type { ModuleTree, ModuleTreeDefinition } from './types.ts'
import { flattenModuleTreeDefinition } from './flattening.ts'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing.ts'
import { validateAndProcessLinks } from './linkProcessing.ts'

// Create a module tree from a module tree definition, validating and processing the prerequisites and links.
export function createModuleTree(moduleTreeDefinition: ModuleTreeDefinition): ModuleTree {
	const moduleTree = flattenModuleTreeDefinition(moduleTreeDefinition)
	validateAndProcessPrerequisites(moduleTree)
	validateAndProcessLinks(moduleTree)
	return moduleTree
}
