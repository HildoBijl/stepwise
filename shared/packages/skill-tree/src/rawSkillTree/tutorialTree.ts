import { and, repeat } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition'

export const tutorialTree: RawSkillGroup = {
	fundamentalInputs: {
		enterInteger: {
			name: 'Enter an integer',
		},
	},
	physicsInputs: {
		enterFloat: {
			name: 'Enter a decimal number',
		},
		enterUnit: {
			name: 'Enter a unit',
		},
		lookUpConstant: {
			name: 'Look up a constant',
		},
	},
	mathInputs: {
		enterExpression: {
			name: 'Enter an expression',
		},
		enterEquation: {
			name: 'Enter an equation',
		},
	},
	stepExercises: {
		summation: {
			name: 'Add numbers',
		},
		multiplication: {
			name: 'Multiply numbers',
		},
		summationAndMultiplication: {
			name: 'Add and multiply numbers',
			setup: and(repeat('multiplication', 2), 'summation'),
		},
	},
}
