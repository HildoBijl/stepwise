import type { ModuleTreeDefinition } from '@step-wise/module-tree-definition'

import { demoTree } from './demoTree.ts'
import { mathematicsTree } from './mathematicsTree.ts'
import { mechanicsTree } from './mechanicsTree.ts'
import { physicsTree } from './physicsTree.ts'

export const moduleTreeDefinition: ModuleTreeDefinition = {
	demo: demoTree,
	mathematics: mathematicsTree,
	mechanics: mechanicsTree,
	physics: physicsTree,
}
