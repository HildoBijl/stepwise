import type { RawSkillGroup } from './types'
import { flattenSkillTree, applyContinuations, processExercises } from './support'
import { applyLinks } from './links'

export function processSkillTree(rawSkillTree: RawSkillGroup) {
	const { skillTree, skillsPerGroup } = flattenSkillTree(rawSkillTree)
	applyContinuations(skillTree)
	applyLinks(skillTree)
	processExercises(skillTree) // Exercise legacy
	return { skillTree, skillsPerGroup }
}
