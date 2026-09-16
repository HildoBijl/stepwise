import { and, repeat } from '@step-wise/skill-setup'
import type { ModuleTreeDefinition } from '@step-wise/module-tree-definition'

export const demoTree: ModuleTreeDefinition = {
	demo: {
		type: 'skill',
	},
	test: {
		type: 'skill',
		setup: repeat('demo', 2),
	},
	inputs: {
		enterInteger: {
			type: 'skill',
		},
	},
	stepExercises: {
		summation: {
			type: 'skill',
		},
		multiplication: {
			type: 'skill',
		},
		summationAndMultiplication: {
			type: 'skill',
			setup: and(repeat('multiplication', 2), 'summation'),
		},
	},
}
