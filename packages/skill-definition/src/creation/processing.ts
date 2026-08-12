import type { RawSkillGroup, SkillTree } from './types'
import { flattenSkillTree, applyContinuations } from './support'
import { applyLinks } from './links'

export function processSkillTree(rawSkillTree: RawSkillGroup): SkillTree {
	const skillTree = flattenSkillTree(rawSkillTree)
	applyContinuations(skillTree)
	applyLinks(skillTree)
	return skillTree
}
