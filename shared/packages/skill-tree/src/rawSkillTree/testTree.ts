import { repeat } from '@step-wise/skill-setup'
import type { RawSkillGroup } from '@step-wise/skill-definition'

export const testTree: RawSkillGroup = {
	demo: {
		name: 'Demo exercise',
	},
	test: {
		name: 'Test exercise',
		setup: repeat('demo', 2),
	},
}
