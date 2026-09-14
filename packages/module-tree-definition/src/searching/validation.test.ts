import { describe, expect, it } from 'vitest'

import { and } from '@step-wise/skill-setup'

import { createModuleTree } from '../creation/index.ts'

import { ensureModuleId, ensureModuleIds, ensureSkillId, ensureSkillIds, ensureSkillSetup } from './validation.ts'

const tree = createModuleTree({ Alpha: { type: 'skill', name: 'Alpha' }, beta: { type: 'skill', name: 'Beta' } })

describe('ensureSkillId', () => {
	it('returns exact IDs and rejects different casing by default', () => {
		expect(ensureSkillId(tree, 'Alpha')).toBe('Alpha')
		expect(() => ensureSkillId(tree, 'ALPHA')).toThrow(/Unknown module ID/)
		expect(() => ensureSkillId(tree, 'BeTa')).toThrow(/Unknown module ID/)
	})

	it('optionally resolves canonical casing', () => {
		const options = { allowCaseInsensitiveMatch: true }
		expect(ensureSkillId(tree, 'ALPHA', options)).toBe('Alpha')
		expect(ensureSkillId(tree, 'BeTa', options)).toBe('beta')
	})

	it('supports special object-property IDs without accepting inherited properties', () => {
		const specialTree = createModuleTree({ constructor: { type: 'skill', name: 'Constructor' }, toString: { type: 'skill', name: 'To string' } })
		expect(ensureSkillId(specialTree, 'CONSTRUCTOR', { allowCaseInsensitiveMatch: true })).toBe('constructor')
		expect(ensureSkillId(specialTree, 'toString')).toBe('toString')
		expect(() => ensureSkillId(specialTree, 'valueOf')).toThrow(/Unknown module ID/)
	})

	it('rejects unknown IDs', () => {
		expect(() => ensureSkillId(tree, 'missing')).toThrow(/Unknown module ID/)
	})
})

describe('module and skill validation', () => {
	const mixedTree = createModuleTree({ concept: { type: 'concept', name: 'Concept' }, skill: { type: 'skill', name: 'Skill' } })

	it('accepts concepts through the module helpers', () => {
		expect(ensureModuleId(mixedTree, 'concept')).toBe('concept')
		expect(ensureModuleIds(mixedTree, ['skill', 'concept'])).toEqual(['skill', 'concept'])
	})

	it('rejects concepts through the skill helpers', () => {
		expect(() => ensureSkillId(mixedTree, 'concept')).toThrow('identifies a concept')
		expect(() => ensureSkillIds(mixedTree, ['skill', 'concept'])).toThrow('identifies a concept')
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
