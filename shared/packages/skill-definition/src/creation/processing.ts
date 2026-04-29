import type { RawSkillGroup, SkillTree } from './types'
import { flattenSkillTree, applyContinuations, processExercises } from './support'
import { applyLinks } from './links'

export function processSkillTree(rawSkillTree: RawSkillGroup): SkillTree {
	const skillTree = flattenSkillTree(rawSkillTree)
	applyContinuations(skillTree)
	applyLinks(skillTree)
	processExercises(skillTree) // Exercise legacy
	return skillTree
}
