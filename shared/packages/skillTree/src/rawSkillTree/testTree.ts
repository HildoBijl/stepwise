import { repeat } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition/dist/creation'

export const testTree: RawSkillGroup = {
	test: {
		name: 'Test exercise',
		examples: ['testExercise'],
		exercises: ['testExercise'],
	},
	demo: {
		name: 'Demo exercise',
		setup: repeat('test', 2),
		examples: ['demoExercise'],
		exercises: ['demoExercise'],
	},
}
