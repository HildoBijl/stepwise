import type { RawSkillTree, SkillTree } from './types'
import { flattenRawSkillTree } from './flattening'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing'
import { validateAndProcessLinks } from './linkProcessing'

export function createSkillTree(rawSkillTree: RawSkillTree): SkillTree {
	const skillTree = flattenRawSkillTree(rawSkillTree)
	validateAndProcessPrerequisites(skillTree)
	validateAndProcessLinks(skillTree)
	return skillTree
}
