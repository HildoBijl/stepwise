import { type SkillId, Skill, processSkillTree, ensureSkillId } from '@step-wise/skill-definition'

import { rawSkillTree } from './rawSkillTree'

export const skillTree = processSkillTree(rawSkillTree)

export function getSkill(skillId: SkillId): Skill {
	return skillTree[ensureSkillId(skillTree, skillId)]
}
