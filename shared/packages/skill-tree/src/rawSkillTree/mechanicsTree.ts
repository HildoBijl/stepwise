import { and, repeat } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition'

export const mechanicsTree: RawSkillGroup = {
	equilibrium: {
		calculateForceOrMoment: {
			name: 'Calculate a force or moment',
			exercises: ['calculateForceOrMomentUseVerticalForces', 'calculateForceOrMomentUseHorizontalForces', 'calculateForceOrMomentUseDiagonalForces', 'calculateForceOrMomentUseMomentsWithOnlyForces', 'calculateForceOrMomentUseMomentsWithMomentAsked', 'calculateForceOrMomentUseMomentsWithMomentGiven'],
		},
	},
	supportReactions: {
		schematizeSupport: {
			name: 'Schematize a support',
			exercises: ['schematizeFixedSupport', 'schematizeRollerSupport', 'schematizeHingeSupport', 'schematizeRollerHingeSupport'],
		},
		drawFreeBodyDiagram: {
			name: 'Draw a free body diagram',
			setup: repeat('schematizeSupport', 2),
			exercises: ['drawFreeBodyDiagram1'],
		},
		calculateBasicSupportReactions: {
			name: 'Calculate basic support reactions',
			setup: and('drawFreeBodyDiagram', repeat('calculateForceOrMoment', 2)),
			exercises: ['calculateBasicSupportReactionsDiagonalSupport', 'calculateBasicSupportReactionsDiagonalBeam', 'calculateBasicSupportReactionsFixedWithDiagonalLoad', 'calculateBasicSupportReactionsFixedWithElevatedLoad'],
		},
	},
}
