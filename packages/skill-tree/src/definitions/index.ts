import type { SkillTreeDefinition } from '@step-wise/skill-definition'

import { demoTree } from './demoTree.ts'
import { mathematicsTree } from './mathematicsTree.ts'
import { mechanicsTree } from './mechanicsTree.ts'
import { physicsTree } from './physicsTree.ts'

export const moduleTreeDefinition: SkillTreeDefinition = {
	demo: demoTree,
	mathematics: mathematicsTree,
	mechanics: mechanicsTree,
	physics: physicsTree,
}
