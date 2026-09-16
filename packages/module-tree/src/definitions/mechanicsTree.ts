import { and, repeat } from '@step-wise/skill-setup'
import type { ModuleTreeDefinition } from '@step-wise/module-tree-definition'

export const mechanicsTree: ModuleTreeDefinition = {
	equilibrium: {
		calculateForceOrMoment: {
			type: 'skill',
		},
	},
	supportReactions: {
		schematizeSupport: {
			type: 'skill',
		},
		drawFreeBodyDiagram: {
			type: 'skill',
			setup: repeat('schematizeSupport', 2),
		},
		calculateBasicSupportReactions: {
			type: 'skill',
			setup: and('drawFreeBodyDiagram', repeat('calculateForceOrMoment', 2)),
		},
	},
}
