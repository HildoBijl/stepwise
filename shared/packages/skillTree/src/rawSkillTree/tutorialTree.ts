import { and, repeat } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition/dist/creation'

export const tutorialTree: RawSkillGroup = {
	numberInputs: {
		enterInteger: {
			name: 'Enter an integer',
			examples: ['enterInteger'],
			exercises: ['enterInteger'],
		},
		enterFloat: {
			name: 'Enter a decimal number',
			examples: ['enterFloat'],
			exercises: ['enterFloat'],
		},
		enterUnit: {
			name: 'Enter a unit',
			examples: ['enterUnit'],
			exercises: ['enterUnit'],
		},
		lookUpConstant: {
			name: 'Look up a constant',
			examples: ['lookUpConstant'],
			exercises: ['lookUpConstant'],
		},
	},
	mathInputs: {
		enterExpression: {
			name: 'Enter an expression',
			examples: ['enterExpression'],
			exercises: ['enterExpression'],
		},
		enterEquation: {
			name: 'Enter an equation',
			examples: ['enterEquation'],
			exercises: ['enterEquation'],
		},
	},
	steps: {
		summation: {
			name: 'Add numbers',
			examples: ['summation1'],
			exercises: ['summation1'],
		},
		multiplication: {
			name: 'Multiply numbers',
			examples: ['multiplication1'],
			exercises: ['multiplication1'],
		},
		summationAndMultiplication: {
			name: 'Add and multiply numbers',
			setup: and(repeat('multiplication', 2), 'summation'),
			examples: ['summationAndMultiplication1'],
			exercises: ['summationAndMultiplication1', 'summationAndMultiplication2'],
		},
	},
}
