import { processSkillTree } from '@step-wise/skill-definition'

import { rawSkillTree } from './rawSkillTree'

export const skillTree = processSkillTree(rawSkillTree)
