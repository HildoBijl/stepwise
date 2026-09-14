import { describe, expect, it } from 'vitest'

import { createModuleTree } from '../creation/index.ts'

import { sortModuleIdsByTreeOrder, sortSkillIdsByTreeOrder } from './ordering.ts'

const tree = createModuleTree({ Alpha: { type: 'skill', name: 'Alpha' }, beta: { type: 'skill', name: 'Beta' }, gamma: { type: 'skill', name: 'Gamma' } })

describe('sortSkillIdsByTreeOrder', () => {
	it('sorts IDs by tree order while preserving duplicates', () => {
		expect(sortSkillIdsByTreeOrder(tree, ['gamma', 'beta', 'Alpha', 'beta'])).toEqual(['Alpha', 'beta', 'beta', 'gamma'])
	})

	it('handles empty and single-item arrays', () => {
		expect(sortSkillIdsByTreeOrder(tree, [])).toEqual([])
		expect(sortSkillIdsByTreeOrder(tree, ['beta'])).toEqual(['beta'])
	})

	it('accepts readonly input without mutating it', () => {
		const input = ['gamma', 'Alpha'] as const
		expect(sortSkillIdsByTreeOrder(tree, input)).toEqual(['Alpha', 'gamma'])
		expect(input).toEqual(['gamma', 'Alpha'])
	})

	it('rejects unknown IDs', () => {
		expect(() => sortSkillIdsByTreeOrder(tree, ['missing'])).toThrow(/missing/)
		expect(() => sortSkillIdsByTreeOrder(tree, ['ALPHA'])).toThrow(/ALPHA/)
	})
})

describe('sortModuleIdsByTreeOrder', () => {
	it('sorts concepts and skills together', () => {
		const mixedTree = createModuleTree({ concept: { type: 'concept', name: 'Concept' }, skill: { type: 'skill', name: 'Skill' } })
		expect(sortModuleIdsByTreeOrder(mixedTree, ['skill', 'concept'])).toEqual(['concept', 'skill'])
	})
})
