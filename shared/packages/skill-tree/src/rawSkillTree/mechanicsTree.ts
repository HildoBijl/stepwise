import { and, repeat } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition'

export const mechanicsTree: RawSkillGroup = {
	equilibrium: {
		calculateForceOrMoment: {
			name: 'Calculate a force or moment',
		},
	},
	supportReactions: {
		schematizeSupport: {
			name: 'Schematize a support',
		},
		drawFreeBodyDiagram: {
			name: 'Draw a free body diagram',
			setup: repeat('schematizeSupport', 2),
		},
		calculateBasicSupportReactions: {
			name: 'Calculate basic support reactions',
			setup: and('drawFreeBodyDiagram', repeat('calculateForceOrMoment', 2)),
		},
	},
}
