import { and, repeat } from '@step-wise/skill-setup'
import type { SkillTreeDefinition } from '@step-wise/module-tree-definition'

export const demoTree: SkillTreeDefinition = {
	demo: {
		type: 'skill',
		name: 'Demo exercise',
	},
	test: {
		type: 'skill',
		name: 'Test exercise',
		setup: repeat('demo', 2),
	},
	inputs: {
		enterInteger: {
			type: 'skill',
			name: 'Enter an integer',
		},
	},
	stepExercises: {
		summation: {
			type: 'skill',
			name: 'Add numbers',
		},
		multiplication: {
			type: 'skill',
			name: 'Multiply numbers',
		},
		summationAndMultiplication: {
			type: 'skill',
			name: 'Add and multiply numbers',
			setup: and(repeat('multiplication', 2), 'summation'),
		},
	},
}
