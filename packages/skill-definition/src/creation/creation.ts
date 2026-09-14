import type { SkillTreeDefinition, SkillTree } from './types.ts'
import { flattenSkillTreeDefinition } from './flattening.ts'
import { validateAndProcessPrerequisites } from './prerequisiteProcessing.ts'
import { validateAndProcessLinks } from './linkProcessing.ts'

export function createSkillTree(skillTreeDefinition: SkillTreeDefinition): SkillTree {
	const skillTree = flattenSkillTreeDefinition(skillTreeDefinition)
	validateAndProcessPrerequisites(skillTree)
	validateAndProcessLinks(skillTree)
	return skillTree
}
