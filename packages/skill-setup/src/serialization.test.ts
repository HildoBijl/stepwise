import { describe, expect, it } from 'vitest'

import { and, deserializeSetup, or, part, pick, repeat, serializeSetup, skill } from './index'

describe('serialization', () => {
	it.each([
		[skill('a'), { type: 'Skill', value: 'a' }],
		[and('a', 'b'), { type: 'And', value: { skills: [{ type: 'Skill', value: 'a' }, { type: 'Skill', value: 'b' }] } }],
		[or('a', 'b'), { type: 'Or', value: { skills: [{ type: 'Skill', value: 'a' }, { type: 'Skill', value: 'b' }] } }],
		[repeat('a', 2), { type: 'Repeat', value: { skill: { type: 'Skill', value: 'a' }, repeat: 2 } }],
		[pick(['a', 'b']), { type: 'Pick', value: { skills: [{ type: 'Skill', value: 'a' }, { type: 'Skill', value: 'b' }] } }],
		[pick(['a', 'b'], 1, [2, 1]), { type: 'Pick', value: { skills: [{ type: 'Skill', value: 'a' }, { type: 'Skill', value: 'b' }], weights: [2, 1] } }],
		[part('a'), { type: 'Part', value: { skill: { type: 'Skill', value: 'a' } } }],
		[part('a', 0.25), { type: 'Part', value: { skill: { type: 'Skill', value: 'a' }, part: 0.25 } }],
	])('serializes %s', (setup, expected) => {
		expect(serializeSetup(setup)).toEqual(expected)
	})

	it.each([
		skill('a'),
		and('a', 'b'),
		or('a', part('b')),
		repeat(or('a', 'b'), 2),
		pick(['a', repeat('b', 2)], 1, [2, 1]),
		part(and('a', 'b'), 0.25),
	])('round-trips %s', setup => {
		expect(serializeSetup(deserializeSetup(serializeSetup(setup)))).toEqual(serializeSetup(setup))
	})

	it('supports skill strings as shorthand serialized values', () => {
		expect(serializeSetup(deserializeSetup('a'))).toEqual({ type: 'Skill', value: 'a' })
	})

	it.each([
		['null', null],
		['an array', []],
		['a missing type', { value: 'a' }],
		['a non-string type', { type: 1, value: 'a' }],
		['a missing value', { type: 'Skill' }],
		['an unknown type', { type: 'Unknown', value: 'a' }],
		['an invalid Skill value', { type: 'Skill', value: 3 }],
		['a non-object list value', { type: 'And', value: null }],
		['a non-array skills value', { type: 'Or', value: { skills: 'a' } }],
		['a missing Repeat skill', { type: 'Repeat', value: { repeat: 2 } }],
		['a missing Pick skills list', { type: 'Pick', value: {} }],
		['a missing Part skill', { type: 'Part', value: {} }],
	])('rejects %s', (_, input) => {
		expect(() => deserializeSetup(input)).toThrow()
	})
})
