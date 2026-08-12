import type { RawSkillGroup } from '@step-wise/skill-definition'

import { demoTree } from './demoTree'
import { mathematicsTree } from './mathematicsTree'
import { mechanicsTree } from './mechanicsTree'
import { physicsTree } from './physicsTree'

export const rawSkillTree: RawSkillGroup = {
	demo: demoTree,
	mathematics: mathematicsTree,
	mechanics: mechanicsTree,
	physics: physicsTree,
}
