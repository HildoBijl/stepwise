import { and, repeat } from '@step-wise/skill-setup'
import type { SkillTreeDefinition } from '@step-wise/skill-definition'

export const mechanicsTree: SkillTreeDefinition = {
	equilibrium: {
		calculateForceOrMoment: {
			type: 'skill',
			name: 'Calculate a force or moment',
		},
	},
	supportReactions: {
		schematizeSupport: {
			type: 'skill',
			name: 'Schematize a support',
		},
		drawFreeBodyDiagram: {
			type: 'skill',
			name: 'Draw a free body diagram',
			setup: repeat('schematizeSupport', 2),
		},
		calculateBasicSupportReactions: {
			type: 'skill',
			name: 'Calculate basic support reactions',
			setup: and('drawFreeBodyDiagram', repeat('calculateForceOrMoment', 2)),
		},
	},
}
