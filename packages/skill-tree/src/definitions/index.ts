import type { RawSkillTree } from '@step-wise/skill-definition'

import { demoTree } from './demoTree'
import { mathematicsTree } from './mathematicsTree'
import { mechanicsTree } from './mechanicsTree'
import { physicsTree } from './physicsTree'

export const rawSkillTree: RawSkillTree = {
	demo: demoTree,
	mathematics: mathematicsTree,
	mechanics: mechanicsTree,
	physics: physicsTree,
}
