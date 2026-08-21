import { and } from '@step-wise/skill-setup'
import { describe, expect, it } from 'vitest'

import { createSkillTree } from '../creation'

import { ensureSkillId, ensureSkillIds, ensureSkillSetup } from './validation'

const tree = createSkillTree({ Alpha: { name: 'Alpha' }, beta: { name: 'Beta' } })

describe('ensureSkillId', () => {
	it('returns exact IDs and resolves canonical casing', () => {
		expect(ensureSkillId(tree, 'Alpha')).toBe('Alpha')
		expect(ensureSkillId(tree, 'ALPHA')).toBe('Alpha')
		expect(ensureSkillId(tree, 'BeTa')).toBe('beta')
	})

	it('supports special object-property IDs without accepting inherited properties', () => {
		const specialTree = createSkillTree({ constructor: { name: 'Constructor' }, toString: { name: 'To string' } })
		expect(ensureSkillId(specialTree, 'CONSTRUCTOR')).toBe('constructor')
		expect(ensureSkillId(specialTree, 'toString')).toBe('toString')
		expect(() => ensureSkillId(specialTree, 'valueOf')).toThrow(/Unknown skill ID/)
	})

	it('rejects unknown IDs', () => {
		expect(() => ensureSkillId(tree, 'missing')).toThrow(/Unknown skill ID/)
	})
})

describe('ensureSkillIds', () => {
	it('accepts one ID or a readonly array and normalizes every ID', () => {
		expect(ensureSkillIds(tree, 'ALPHA')).toEqual(['Alpha'])
		const input = ['BETA', 'alpha', 'BETA'] as const
		const result = ensureSkillIds(tree, input)
		expect(result).toEqual(['beta', 'Alpha', 'beta'])
		expect(result).not.toBe(input)
	})

	it('rejects an array containing an unknown ID', () => {
		expect(() => ensureSkillIds(tree, ['Alpha', 'missing'])).toThrow(/missing/)
	})
})

describe('ensureSkillSetup', () => {
	it('normalizes setup shorthand and accepts known skill references case-insensitively', () => {
		expect(ensureSkillSetup(tree, 'ALPHA').getSkillList()).toEqual(['ALPHA'])
		const setup = and('Alpha', 'BETA')
		expect(ensureSkillSetup(tree, setup)).toBe(setup)
	})

	it('rejects setups referring to unknown skills', () => {
		expect(() => ensureSkillSetup(tree, and('Alpha', 'missing'))).toThrow(/missing/)
	})
})
