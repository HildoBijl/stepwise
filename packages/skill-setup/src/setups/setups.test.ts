import { describe, expect, it } from 'vitest'

import { compareNumberArrays } from '@step-wise/js-utils'

import { deserializeSetup, serializeSetup } from '../serialization'

import { skill, and, or, repeat, pick, part } from './index'

describe('serialization types', () => {
	it('use stable explicit identifiers', () => {
		expect(skill('a').serialize()).toEqual({ type: 'Skill', value: 'a' })
		expect(and('a').type).toBe('And')
		expect(or('a').type).toBe('Or')
		expect(repeat('a', 2).type).toBe('Repeat')
		expect(pick(['a', 'b']).type).toBe('Pick')
		expect(part('a', 0.5).type).toBe('Part')
	})

	it('round-trips nested setups', () => {
		const setup = and('a', repeat(or('b', 'c'), 2))
		expect(serializeSetup(deserializeSetup(serializeSetup(setup)))).toEqual(serializeSetup(setup))
	})

	it('rejects malformed serialized setups', () => {
		expect(() => deserializeSetup(null)).toThrow(TypeError)
		expect(() => deserializeSetup([])).toThrow(TypeError)
		expect(() => deserializeSetup({ value: 'a' })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'Skill' })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'Unknown', value: 'a' })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'Skill', value: 3 })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'And', value: null })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'Or', value: { skills: 'a' } })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'Repeat', value: {} })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'Pick', value: {} })).toThrow(TypeError)
		expect(() => deserializeSetup({ type: 'Part', value: {} })).toThrow(TypeError)
	})
})

/*
 * Check Skill setup.
 */

describe('Check Skill setup:', () => {
	const setup = skill('a')

	describe('validation', () => {
		it('rejects empty and whitespace-only identifiers', () => {
			expect(() => skill('')).toThrow(RangeError)
			expect(() => skill('   ')).toThrow(RangeError)
		})

		it('preserves valid identifiers as given', () => {
			expect(skill('skill with spaces').skill).toBe('skill with spaces')
		})
	})

	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toHaveLength(1)
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('a')
			expect(compareNumberArrays(setup.getPolynomialCoefficients() as number[], [0, 1])).toBe(true)
		})
	})
})

/*
 * Check and setup.
 */

describe('Check and setup:', () => {
	const setup = and('a', 'b')

	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toHaveLength(2)
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('a*b')
			expect(compareNumberArrays(setup.getPolynomialCoefficients() as number[][], [[0, 0], [0, 1]])).toBe(true)
		})
	})
})

/*
 * Check or setup.
 */

describe('Check or setup:', () => {
	const setup = or('a', 'b')

	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toHaveLength(2)
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('b+a-a*b')
			expect(compareNumberArrays(setup.getPolynomialCoefficients() as number[][], [[0, 1], [1, -1]])).toBe(true)
		})
	})
})

/*
 * Check repeat setup.
 */

describe('Check repeat setup:', () => {
	const setup = repeat('b', 3)

	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toHaveLength(1)
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('b^3')
			expect(compareNumberArrays(setup.getPolynomialCoefficients() as number[], [0, 0, 0, 1])).toBe(true)
		})
	})
})

/*
 * Check pick setup.
 */

describe('Check pick setup:', () => {
	const setup = pick(['a', 'b'], 1, [3, 1])

	describe('validation and properties', () => {
		it('allows selecting every supplied setup', () => {
			const selectAll = pick(['a', 'b'], 2)
			expect(selectAll.isDeterministic()).toBe(true)
			expect(compareNumberArrays(selectAll.getPolynomialCoefficients() as number[][], [[0, 0], [0, 1]])).toBe(true)
		})

		it('rejects selecting more than the number of supplied setups', () => {
			expect(() => pick(['a', 'b'], 3)).toThrow(RangeError)
		})

		it('remains non-deterministic when selection or a selected child is non-deterministic', () => {
			expect(pick(['a', 'b']).isDeterministic()).toBe(false)
			expect(pick([pick(['a', 'b']), 'c'], 2).isDeterministic()).toBe(false)
		})
	})

	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toHaveLength(2)
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('0.25*b+0.75*a')
			expect(compareNumberArrays(setup.getPolynomialCoefficients() as number[][], [[0, 1 / 4], [3 / 4, 0]])).toBe(true)
		})

		it('combines multiple weighted picks correctly', () => {
			const coefficients = pick(['a', 'b', 'c'], 2, [1, 2, 3]).getPolynomialCoefficients()
			expect(compareNumberArrays(coefficients as number[][][], [[[0, 0], [0, 6 / 11]], [[0, 3 / 11], [2 / 11, 0]]])).toBe(true)
		})
	})
})

/*
 * Check part setup.
 */

describe('Check part setup:', () => {
	const setupAnd = and('a', part('b', 3 / 4))
	const setupOr = or('a', part('b', 3 / 4))

	describe('validation', () => {
		it('uses one half by default', () => {
			expect(part('a').part).toBe(0.5)
		})

		it('accepts the boundary values', () => {
			expect(part('a', 0).part).toBe(0)
			expect(part('a', 1).part).toBe(1)
		})

		it('rejects invalid values', () => {
			expect(() => part('a', -0.1)).toThrow(RangeError)
			expect(() => part('a', 1.1)).toThrow(RangeError)
			expect(() => part('a', NaN)).toThrow(TypeError)
			expect(() => part('a', Infinity)).toThrow(TypeError)
		})
	})

	describe('properties', () => {
		it('is deterministic when the wrapped setup is never included', () => {
			expect(part(pick(['a', 'b']), 0).isDeterministic()).toBe(true)
		})

		it('inherits determinism when the wrapped setup is always included', () => {
			expect(part('a', 1).isDeterministic()).toBe(true)
			expect(part(pick(['a', 'b']), 1).isDeterministic()).toBe(false)
		})

		it('is non-deterministic for probabilities between zero and one', () => {
			expect(part('a', 0.5).isDeterministic()).toBe(false)
		})
	})

	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setupAnd.getSkillList()).toHaveLength(2)
			expect(setupAnd.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
			expect(setupOr.getSkillList()).toHaveLength(2)
			expect(setupOr.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setupAnd.getPolynomialString()).toBe('0.25*a+0.75*a*b')
			expect(setupOr.getPolynomialString()).toBe('0.75*b+a-0.75*a*b')
			expect(compareNumberArrays(setupAnd.getPolynomialCoefficients() as number[][], [[0, 0], [1 / 4, 3 / 4]])).toBe(true)
			expect(compareNumberArrays(setupOr.getPolynomialCoefficients() as number[][], [[0, 3 / 4], [1, -3 / 4]])).toBe(true)
		})
	})
})
