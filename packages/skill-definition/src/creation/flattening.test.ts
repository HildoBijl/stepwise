import { and } from '@step-wise/skill-setup'
import { describe, expect, it } from 'vitest'

import { flattenRawSkillTree } from './flattening.ts'
import type { RawSkillTree } from './types.ts'

describe('flattenRawSkillTree', () => {
	it('flattens nested groups and derives paths and group skill IDs', () => {
		const tree = flattenRawSkillTree({ subject: { group: { a: { name: 'A' }, b: { name: 'B' } }, c: { name: 'C' } } })
		expect(Object.keys(tree)).toEqual(['a', 'b', 'c'])
		expect(tree.a).toMatchObject({ id: 'a', name: 'A', groupPath: ['subject', 'group'], groupSkillIds: ['a', 'b'] })
		expect(tree.b.groupSkillIds).toBe(tree.a.groupSkillIds)
		expect(tree.c).toMatchObject({ groupPath: ['subject'], groupSkillIds: ['c'] })
	})

	it('keeps structurally different groups separate when their paths serialize equally', () => {
		const tree = flattenRawSkillTree({ 'a/b': { first: { name: 'First' } }, a: { b: { second: { name: 'Second' } } } })
		expect(tree.first.groupSkillIds).toEqual(['first'])
		expect(tree.second.groupSkillIds).toEqual(['second'])
		expect(tree.first.groupSkillIds).not.toBe(tree.second.groupSkillIds)
	})

	it('combines and deduplicates explicit and setup-derived prerequisites', () => {
		const setup = and('a', 'b')
		const tree = flattenRawSkillTree({ a: { name: 'A' }, b: { name: 'B' }, c: { name: 'C', prerequisites: ['a'], setup, thresholds: { pass: 0.7 } } })
		expect(tree.c.prerequisiteIds).toEqual(['a', 'b'])
		expect(tree.c.setup).toBe(setup)
		expect(tree.c.thresholds).toEqual({ pass: 0.7 })
		expect(tree.c).toMatchObject({ continuationIds: [], linkedSkillIds: [] })
	})

	it('normalizes preliminary links', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation: 0.5 } }, b: { name: 'B' } })
		expect(tree.a.links).toEqual([{ skillIds: ['b'], correlation: 0.5 }])
	})

	it('returns a prototype-free tree and supports special skill IDs', () => {
		const rawTree = Object.create(null) as RawSkillTree
		Object.defineProperty(rawTree, 'toString', { value: { name: 'To string' }, enumerable: true })
		Object.defineProperty(rawTree, 'constructor', { value: { name: 'Constructor' }, enumerable: true })
		Object.defineProperty(rawTree, '__proto__', { value: { name: 'Prototype' }, enumerable: true })
		const tree = flattenRawSkillTree(rawTree)
		expect(Object.getPrototypeOf(tree)).toBeNull()
		expect(Object.keys(tree)).toEqual(['toString', 'constructor', '__proto__'])
	})

	it('allows a group to contain a skill whose ID is name', () => {
		const tree = flattenRawSkillTree({ group: { name: { name: 'Name' }, other: { name: 'Other' } } })
		expect(tree.name.groupPath).toEqual(['group'])
		expect(tree.name.groupSkillIds).toEqual(['name', 'other'])
	})

	it('rejects exact and case-insensitive duplicate IDs with their paths', () => {
		expect(() => flattenRawSkillTree({ first: { a: { name: 'First' } }, second: { a: { name: 'Second' } } })).toThrow(/first\/a.*second\/a|second\/a.*first\/a/)
		expect(() => flattenRawSkillTree({ first: { Skill: { name: 'First' } }, second: { skill: { name: 'Second' } } })).toThrow(/regardless of casing/)
	})

	it('rejects empty skill IDs and names', () => {
		expect(() => flattenRawSkillTree({ '': { name: 'Empty ID' } })).toThrow(RangeError)
		expect(() => flattenRawSkillTree({ a: { name: '' } })).toThrow(RangeError)
		expect(() => flattenRawSkillTree({ a: { name: '   ' } })).toThrow(RangeError)
	})

	it('rejects skill IDs and references with surrounding whitespace', () => {
		expect(() => flattenRawSkillTree({ ' a': { name: 'A' } })).toThrow(/start or end with whitespace/)
		expect(() => flattenRawSkillTree({ 'a ': { name: 'A' } })).toThrow(/start or end with whitespace/)
		expect(() => flattenRawSkillTree({ a: { name: 'A', prerequisites: [' b'] } })).toThrow(/start or end with whitespace/)
		expect(() => flattenRawSkillTree({ a: { name: 'A', links: 'b ' } })).toThrow(/start or end with whitespace/)
		expect(() => flattenRawSkillTree({ a: { name: 'A', setup: and(' b', 'c') } })).toThrow(/start or end with whitespace/)
	})

	it('validates raw skill properties', () => {
		expect(() => flattenRawSkillTree({ a: { name: 'A', prerequisites: 'b' } } as unknown as RawSkillTree)).toThrow(/prerequisites.*array/)
		expect(() => flattenRawSkillTree({ a: { name: 'A', setup: {} } } as unknown as RawSkillTree)).toThrow(/setup.*SkillSetup/)
		expect(() => flattenRawSkillTree({ a: { name: 'A', thresholds: 0.5 } } as unknown as RawSkillTree)).toThrow(/thresholds.*plain object/)
	})

	it.each([NaN, -0.1, 1.1, Infinity, '0.5'])('rejects an invalid pass threshold: %s', pass => {
		expect(() => flattenRawSkillTree({ a: { name: 'A', thresholds: { pass } } } as unknown as RawSkillTree)).toThrow()
	})

	it.each([0, 0.5, 1])('accepts a pass threshold on the inclusive unit interval: %s', pass => {
		expect(flattenRawSkillTree({ a: { name: 'A', thresholds: { pass } } }).a.thresholds).toEqual({ pass })
	})

	it('rejects malformed group entries with their path', () => {
		expect(() => flattenRawSkillTree({ group: { broken: 3 } } as unknown as RawSkillTree)).toThrow(/group\/broken/)
	})
})
