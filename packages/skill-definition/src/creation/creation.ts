import type { RawSkillTree, SkillTree } from './types.ts'
import { flattenRawSkillTree } from './flattening.ts'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing.ts'
import { validateAndProcessLinks } from './linkProcessing.ts'

export function createSkillTree(rawSkillTree: RawSkillTree): SkillTree {
	const skillTree = flattenRawSkillTree(rawSkillTree)
	validateAndProcessPrerequisites(skillTree)
	validateAndProcessLinks(skillTree)
	return skillTree
}
