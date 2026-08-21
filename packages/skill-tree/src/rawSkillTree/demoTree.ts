import { and, repeat } from '@step-wise/skill-setup'
import type { RawSkillTree } from '@step-wise/skill-definition'

export const demoTree: RawSkillTree = {
	demo: {
		name: 'Demo exercise',
	},
	test: {
		name: 'Test exercise',
		setup: repeat('demo', 2),
	},
	inputs: {
		enterInteger: {
			name: 'Enter an integer',
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
