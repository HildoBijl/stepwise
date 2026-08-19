import { describe, expect, it } from 'vitest'

import { type Polynomial, comparePolynomials } from '@step-wise/polynomials'

import { type SkillSetupLike, and, ensureSetup, or, part, pick, repeat, setupFactories, skill } from './index'

function expectPolynomial(actual: Polynomial, expected: Polynomial): void {
	expect(comparePolynomials(actual, expected, { allowVariableReordering: false })).toBe(true)
}

describe('public factories', () => {
	it('exposes the named factories through setupFactories', () => {
		expect(setupFactories).toEqual({ skill, and, or, repeat, pick, part })
	})

	it('turns strings into skills and preserves existing setups', () => {
		const setup = and('a', 'b')
		expect(ensureSetup('a')).toEqual(skill('a'))
		expect(ensureSetup(setup)).toBe(setup)
	})

	it('rejects values that cannot represent a setup', () => {
		expect(() => ensureSetup(null as unknown as SkillSetupLike)).toThrow()
	})
})

describe('construction and validation', () => {
	it('rejects empty and whitespace-only skill identifiers', () => {
		expect(() => skill('')).toThrow(RangeError)
		expect(() => skill('   ')).toThrow(RangeError)
	})

	it('preserves valid skill identifiers', () => {
		expect(skill('skill with spaces').skill).toBe('skill with spaces')
	})

	it('requires And and Or to contain at least one setup', () => {
		expect(() => and()).toThrow()
		expect(() => or()).toThrow()
	})

	it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid repeat count %s', count => {
		expect(() => repeat('a', count)).toThrow()
	})

	it('requires Pick to contain at least one setup', () => {
		expect(() => pick([])).toThrow()
	})

	it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid Pick count %s', count => {
		expect(() => pick(['a', 'b'], count)).toThrow()
	})

	it('rejects selecting more setups than are available', () => {
		expect(() => pick(['a', 'b'], 3)).toThrow(RangeError)
	})

	it('requires one valid positive weight per setup', () => {
		expect(() => pick(['a', 'b'], 1, [1])).toThrow()
		expect(() => pick(['a', 'b'], 1, [1, 0])).toThrow()
		expect(() => pick(['a', 'b'], 1, [1, -1])).toThrow()
		expect(() => pick(['a', 'b'], 1, [1, NaN])).toThrow()
		expect(() => pick(['a', 'b'], 1, [1, Infinity])).toThrow()
	})

	it('uses one half as the default Part probability', () => {
		expect(part('a').part).toBe(0.5)
	})

	it('accepts the Part probability boundaries', () => {
		expect(part('a', 0).part).toBe(0)
		expect(part('a', 1).part).toBe(1)
	})

	it.each([-0.1, 1.1, NaN, Infinity])('rejects invalid Part probability %s', probability => {
		expect(() => part('a', probability)).toThrow()
	})
})

describe('setup properties', () => {
	it('retrieves nested skills once and in encounter order', () => {
		const setup = and('a', or('b', repeat('a', 2)))
		expect(setup.getSkillList()).toEqual(['a', 'b'])
	})

	it('reports deterministic composite setups', () => {
		expect(skill('a').isDeterministic()).toBe(true)
		expect(and('a', repeat('b', 2)).isDeterministic()).toBe(true)
		expect(or('a', 'b').isDeterministic()).toBe(true)
	})

	it('propagates nondeterminism through And, Or and Repeat', () => {
		const randomSetup = pick(['a', 'b'])
		expect(and('c', randomSetup).isDeterministic()).toBe(false)
		expect(or('c', randomSetup).isDeterministic()).toBe(false)
		expect(repeat(randomSetup, 2).isDeterministic()).toBe(false)
	})

	it('treats selecting every deterministic setup as deterministic', () => {
		expect(pick(['a', 'b'], 2).isDeterministic()).toBe(true)
		expect(pick([pick(['a', 'b']), 'c'], 2).isDeterministic()).toBe(false)
	})

	it('handles Part determinism at and between its boundaries', () => {
		expect(part(pick(['a', 'b']), 0).isDeterministic()).toBe(true)
		expect(part('a', 1).isDeterministic()).toBe(true)
		expect(part(pick(['a', 'b']), 1).isDeterministic()).toBe(false)
		expect(part('a', 0.5).isDeterministic()).toBe(false)
	})
})

describe('string representation', () => {
	it.each([
		[skill('a'), '"a"'],
		[and('a', 'b'), 'and("a", "b")'],
		[or('a', 'b'), 'or("a", "b")'],
		[repeat('a', 2), 'repeat("a", 2)'],
		[pick(['a', 'b']), 'pick(["a", "b"])'],
		[pick(['a', 'b'], 1, [2, 1]), 'pick(["a", "b"], 1, [2, 1])'],
		[part('a'), 'part("a")'],
		[part('a', 0.25), 'part("a", 0.25)'],
	])('renders %s', (setup, expected) => {
		expect(setup.toString()).toBe(expected)
	})
})

describe('polynomials', () => {
	it('creates the polynomial for a single skill', () => {
		expectPolynomial(skill('a').getPolynomial(), { coefficients: [0, 1], variables: ['a'] })
		expect(skill('a').getPolynomialString()).toBe('a')
	})

	it('creates And and Or polynomials', () => {
		expectPolynomial(and('a', 'b').getPolynomial(), { coefficients: [[0, 0], [0, 1]], variables: ['a', 'b'] })
		expectPolynomial(or('a', 'b').getPolynomial(), { coefficients: [[0, 1], [1, -1]], variables: ['a', 'b'] })
	})

	it('creates a repeated-skill polynomial', () => {
		expectPolynomial(repeat('a', 3).getPolynomial(), { coefficients: [0, 0, 0, 1], variables: ['a'] })
		expectPolynomial(and('a', 'a').getPolynomial(), { coefficients: [0, 0, 1], variables: ['a'] })
	})

	it('creates weighted Pick polynomials', () => {
		expectPolynomial(pick(['a', 'b'], 1, [3, 1]).getPolynomial(), { coefficients: [[0, 1 / 4], [3 / 4, 0]], variables: ['a', 'b'] })
		expectPolynomial(pick(['a', 'b', 'c'], 2, [1, 2, 3]).getPolynomial(), { coefficients: [[[0, 0], [0, 6 / 11]], [[0, 3 / 11], [2 / 11, 0]]], variables: ['a', 'b', 'c'] })
	})

	it('makes selecting every setup equivalent to And', () => {
		expectPolynomial(pick(['a', 'b'], 2).getPolynomial(), and('a', 'b').getPolynomial())
	})

	it('creates Part polynomials under And and Or', () => {
		expectPolynomial(and('a', part('b', 3 / 4)).getPolynomial(), { coefficients: [[0, 0], [1 / 4, 3 / 4]], variables: ['a', 'b'] })
		expectPolynomial(or('a', part('b', 3 / 4)).getPolynomial(), { coefficients: [[0, 3 / 4], [1, -3 / 4]], variables: ['a', 'b'] })
	})

	it('handles Part probability boundaries under And and Or', () => {
		expectPolynomial(and('a', part('b', 0)).getPolynomial(), { coefficients: [[0, 0], [1, 0]], variables: ['a', 'b'] })
		expectPolynomial(and('a', part('b', 1)).getPolynomial(), and('a', 'b').getPolynomial())
		expectPolynomial(or('a', part('b', 0)).getPolynomial(), { coefficients: [[0, 0], [1, 0]], variables: ['a', 'b'] })
		expectPolynomial(or('a', part('b', 1)).getPolynomial(), or('a', 'b').getPolynomial())
	})

	it('creates a nested composite polynomial', () => {
		const setup = and(or('a', 'b'), repeat('c', 2))
		expectPolynomial(setup.getPolynomial(), { coefficients: [[[0, 0, 0], [0, 0, 1]], [[0, 0, 1], [0, 0, -1]]], variables: ['a', 'b', 'c'] })
	})

	it('rejects calculating an unparented Part polynomial', () => {
		expect(() => part('a').getPolynomial()).toThrow(/And.*Or/)
	})
})
