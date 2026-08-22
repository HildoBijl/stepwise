import { describe, expect, it } from 'vitest'

import { flattenRawSkillTree } from './flattening'
import { normalizeSkillLinks, validateAndProcessLinks } from './linkProcessing'
import type { RawSkillLink } from './types'

describe('normalizeSkillLinks', () => {
	it('handles omitted and empty link collections', () => {
		expect(normalizeSkillLinks()).toEqual([])
		expect(normalizeSkillLinks([])).toEqual([])
	})

	it('normalizes string and grouped-string shorthand', () => {
		expect(normalizeSkillLinks('a')).toEqual([{ skillIds: ['a'] }])
		expect(normalizeSkillLinks(['a', 'b'])).toEqual([{ skillIds: ['a', 'b'] }])
	})

	it('normalizes singular and plural object links and preserves correlation', () => {
		expect(normalizeSkillLinks({ skillId: 'a' })).toEqual([{ skillIds: ['a'] }])
		expect(normalizeSkillLinks({ skillIds: ['a', 'b'], correlation: 0.6 })).toEqual([{ skillIds: ['a', 'b'], correlation: 0.6 }])
		expect(normalizeSkillLinks([{ skillId: 'a' }, { skillId: 'b' }])).toEqual([{ skillIds: ['a'] }, { skillIds: ['b'] }])
	})

	it.each(['', [''], [[]]])('rejects empty link data %#', links => {
		expect(() => normalizeSkillLinks(links as RawSkillLink | RawSkillLink[])).toThrow()
	})

	it.each([null, 1, false])('rejects invalid runtime value %s', links => {
		expect(() => normalizeSkillLinks(links as unknown as RawSkillLink)).toThrow()
	})

	it('rejects object links with missing or inconsistent ID fields', () => {
		expect(() => normalizeSkillLinks({})).toThrow()
		expect(() => normalizeSkillLinks({ skillId: 'a', skillIds: ['b'] })).toThrow(/cannot both be specified/)
		expect(() => normalizeSkillLinks({ skillIds: [''] })).toThrow()
	})

	it.each([NaN, -0.1, 0, 1, 1.1, Infinity])('rejects invalid correlation %s', correlation => {
		expect(() => normalizeSkillLinks({ skillId: 'a', correlation })).toThrow()
	})
})

describe('validateAndProcessLinks', () => {
	it('creates reciprocal links and linked skill IDs', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation: 0.5 } }, b: { name: 'B' } })
		validateAndProcessLinks(tree)
		expect(tree.a.links).toEqual([{ skillIds: ['b'], correlation: 0.5 }])
		expect(tree.b.links).toEqual([{ skillIds: ['a'], correlation: 0.5 }])
		expect(tree.a.linkedSkillIds).toEqual(['b'])
		expect(tree.b.linkedSkillIds).toEqual(['a'])
	})

	it('creates symmetric, tree-ordered multi-skill relationships', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A' }, b: { name: 'B', links: ['c', 'a'] }, c: { name: 'C' } })
		validateAndProcessLinks(tree)
		expect(tree.a.links).toEqual([{ skillIds: ['b', 'c'] }])
		expect(tree.b.links).toEqual([{ skillIds: ['a', 'c'] }])
		expect(tree.c.links).toEqual([{ skillIds: ['a', 'b'] }])
	})

	it('canonicalizes structured links and linked skill IDs independently of declaration order', () => {
		const create = (links: RawSkillLink[]) => {
			const tree = flattenRawSkillTree({ a: { name: 'A', links }, b: { name: 'B' }, c: { name: 'C' }, d: { name: 'D' } })
			validateAndProcessLinks(tree)
			return tree.a
		}
		const first = create([{ skillId: 'd' }, { skillIds: ['c', 'b'] }])
		const second = create([{ skillIds: ['c', 'b'] }, { skillId: 'd' }])
		expect(first.links).toEqual([{ skillIds: ['b', 'c'] }, { skillIds: ['d'] }])
		expect(second.links).toEqual(first.links)
		expect(first.linkedSkillIds).toEqual(['b', 'c', 'd'])
	})

	it('rejects unknown skills without rebuilding any links', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A', links: 'missing' } })
		const originalLinks = tree.a.links
		expect(() => validateAndProcessLinks(tree)).toThrow(/missing.*a/)
		expect(tree.a.links).toBe(originalLinks)
	})

	it('rejects self-links and repeated participant IDs', () => {
		expect(() => validateAndProcessLinks(flattenRawSkillTree({ a: { name: 'A', links: 'a' } }))).toThrow(/cannot link to itself/)
		expect(() => validateAndProcessLinks(flattenRawSkillTree({ a: { name: 'A', links: ['b', 'b'] }, b: { name: 'B' } }))).toThrow(/must not be repeated/)
	})

	it('rejects duplicate reciprocal declarations', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A', links: 'b' }, b: { name: 'B', links: 'a' } })
		expect(() => validateAndProcessLinks(tree)).toThrow(/Duplicate skill link/)
	})

	it('rejects conflicting correlations', () => {
		const tree = flattenRawSkillTree({ a: { name: 'A', links: { skillId: 'b', correlation: 0.4 } }, b: { name: 'B', links: { skillId: 'a', correlation: 0.6 } } })
		expect(() => validateAndProcessLinks(tree)).toThrow(/Conflicting skill link/)
	})
})
