import { type EnsureSkillIdOptions, type Skill, type SkillId, createSkillTree, ensureSkillId } from '@step-wise/skill-definition'

import { rawSkillTree } from './definitions/index.ts'

export const skillTree = createSkillTree(rawSkillTree)

export function getSkill(skillId: SkillId, options: EnsureSkillIdOptions = {}): Skill {
	return skillTree[ensureSkillId(skillTree, skillId, options)]
}
