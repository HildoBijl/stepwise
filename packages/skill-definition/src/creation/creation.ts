import type { RawSkillTree, SkillTree } from './types'
import { flattenRawSkillTree } from './flattening'
import { processPrerequisites } from './prerequisiteProcessing'
import { processLinks } from './linkProcessing'

export function createSkillTree(rawSkillTree: RawSkillTree): SkillTree {
	const skillTree = flattenRawSkillTree(rawSkillTree)
	processPrerequisites(skillTree)
	processLinks(skillTree)
	return skillTree
}
