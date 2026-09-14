import { describe, expect, it } from 'vitest'

import { createModuleTree } from '../creation/index.ts'

import { sortModuleIdsByTreeOrder } from './ordering.ts'

const tree = createModuleTree({ Alpha: { type: 'skill', name: 'Alpha' }, beta: { type: 'skill', name: 'Beta' }, gamma: { type: 'skill', name: 'Gamma' } })

describe('sortModuleIdsByTreeOrder', () => {
	it('sorts IDs by tree order while preserving duplicates', () => {
		expect(sortModuleIdsByTreeOrder(tree, ['gamma', 'beta', 'Alpha', 'beta'])).toEqual(['Alpha', 'beta', 'beta', 'gamma'])
	})

	it('handles empty and single-item arrays', () => {
		expect(sortModuleIdsByTreeOrder(tree, [])).toEqual([])
		expect(sortModuleIdsByTreeOrder(tree, ['beta'])).toEqual(['beta'])
	})

	it('accepts readonly input without mutating it', () => {
		const input = ['gamma', 'Alpha'] as const
		expect(sortModuleIdsByTreeOrder(tree, input)).toEqual(['Alpha', 'gamma'])
		expect(input).toEqual(['gamma', 'Alpha'])
	})

	it('rejects unknown IDs', () => {
		expect(() => sortModuleIdsByTreeOrder(tree, ['missing'])).toThrow(/missing/)
		expect(() => sortModuleIdsByTreeOrder(tree, ['ALPHA'])).toThrow(/ALPHA/)
	})
})

describe('sortModuleIdsByTreeOrder', () => {
	it('sorts concepts and skills together', () => {
		const mixedTree = createModuleTree({ concept: { type: 'concept', name: 'Concept' }, skill: { type: 'skill', name: 'Skill' } })
		expect(sortModuleIdsByTreeOrder(mixedTree, ['skill', 'concept'])).toEqual(['concept', 'skill'])
		expect(sortModuleIdsByTreeOrder(mixedTree, ['skill', 'concept'], { includeConcepts: false })).toEqual(['skill'])
	})
})
