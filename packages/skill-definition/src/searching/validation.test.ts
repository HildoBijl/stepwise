import { describe, expect, it } from 'vitest'

import { and } from '@step-wise/skill-setup'

import { createSkillTree } from '../creation/index.ts'

import { ensureSkillId, ensureSkillIds, ensureSkillSetup } from './validation.ts'

const tree = createSkillTree({ Alpha: { name: 'Alpha' }, beta: { name: 'Beta' } })

describe('ensureSkillId', () => {
	it('returns exact IDs and rejects different casing by default', () => {
		expect(ensureSkillId(tree, 'Alpha')).toBe('Alpha')
		expect(() => ensureSkillId(tree, 'ALPHA')).toThrow(/Unknown skill ID/)
		expect(() => ensureSkillId(tree, 'BeTa')).toThrow(/Unknown skill ID/)
	})

	it('optionally resolves canonical casing', () => {
		const options = { allowCaseInsensitiveMatch: true }
		expect(ensureSkillId(tree, 'ALPHA', options)).toBe('Alpha')
		expect(ensureSkillId(tree, 'BeTa', options)).toBe('beta')
	})

	it('supports special object-property IDs without accepting inherited properties', () => {
		const specialTree = createSkillTree({ constructor: { name: 'Constructor' }, toString: { name: 'To string' } })
		expect(ensureSkillId(specialTree, 'CONSTRUCTOR', { allowCaseInsensitiveMatch: true })).toBe('constructor')
		expect(ensureSkillId(specialTree, 'toString')).toBe('toString')
		expect(() => ensureSkillId(specialTree, 'valueOf')).toThrow(/Unknown skill ID/)
	})

	it('rejects unknown IDs', () => {
		expect(() => ensureSkillId(tree, 'missing')).toThrow(/Unknown skill ID/)
	})
})

describe('ensureSkillIds', () => {
	it('accepts a readonly array and preserves exact IDs', () => {
		const input = ['beta', 'Alpha', 'beta'] as const
		const result = ensureSkillIds(tree, input)
		expect(result).toEqual(['beta', 'Alpha', 'beta'])
		expect(result).not.toBe(input)
	})

	it('optionally resolves canonical casing for every ID', () => {
		expect(ensureSkillIds(tree, ['BETA', 'alpha'], { allowCaseInsensitiveMatch: true })).toEqual(['beta', 'Alpha'])
	})

	it('rejects an array containing an unknown ID', () => {
		expect(() => ensureSkillIds(tree, ['Alpha', 'missing'])).toThrow(/missing/)
	})
})

describe('ensureSkillSetup', () => {
	it('normalizes setup shorthand and requires exact skill references', () => {
		expect(ensureSkillSetup(tree, 'Alpha').getSkillList()).toEqual(['Alpha'])
		const setup = and('Alpha', 'BETA')
		expect(() => ensureSkillSetup(tree, setup)).toThrow(/BETA/)
	})

	it('rejects setups referring to unknown skills', () => {
		expect(() => ensureSkillSetup(tree, and('Alpha', 'missing'))).toThrow(/missing/)
	})
})
