import { processSkillTree } from '@step-wise/skill-definition/dist/creation'

import { rawSkillTree } from './rawSkillTree'

export const { skillTree, skillsPerGroup } = processSkillTree(rawSkillTree)
