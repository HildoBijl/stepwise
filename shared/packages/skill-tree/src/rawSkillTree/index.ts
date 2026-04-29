import type { RawSkillGroup } from '@step-wise/skill-definition'

import { testTree } from './testTree'
import { tutorialTree } from './tutorialTree'
import { mathematicsTree } from './mathematicsTree'
import { mechanicsTree } from './mechanicsTree'
import { physicsTree } from './physicsTree'

export const rawSkillTree: RawSkillGroup = {
	test: testTree,
	tutorial: tutorialTree,
	mathematics: mathematicsTree,
	mechanics: mechanicsTree,
	physics: physicsTree,
}
