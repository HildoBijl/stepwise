import { skill } from '@step-wise/skill-setup'
import { describe, expect, it } from 'vitest'

import { createSkillTree } from './creation'

describe('createSkillTree', () => {
	it('creates a complete skill tree from a nested raw definition', () => {
		const setup = skill('foundation')
		const tree = createSkillTree({
			basics: { foundation: { name: 'Foundation', thresholds: { pass: 0.6 } }, intermediate: { name: 'Intermediate', setup } },
			advanced: { name: 'Advanced', prerequisites: ['intermediate'], links: { skillId: 'foundation', correlation: 0.5 } },
		})
		expect(Object.getPrototypeOf(tree)).toBeNull()
		expect(tree.foundation).toMatchObject({ path: ['basics'], groupSkillIds: ['foundation', 'intermediate'], continuationIds: ['intermediate'], linkedSkillIds: ['advanced'], thresholds: { pass: 0.6 } })
		expect(tree.intermediate).toMatchObject({ prerequisiteIds: ['foundation'], continuationIds: ['advanced'] })
		expect(tree.advanced).toMatchObject({ prerequisiteIds: ['intermediate'], links: [{ skillIds: ['foundation'], correlation: 0.5 }] })
	})

	it('rejects errors from every creation phase', () => {
		expect(() => createSkillTree({ a: { name: '' } })).toThrow()
		expect(() => createSkillTree({ a: { name: 'A', prerequisites: ['missing'] } })).toThrow()
		expect(() => createSkillTree({ a: { name: 'A', links: 'missing' } })).toThrow()
	})
})
