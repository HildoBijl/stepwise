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
	})
})

/*
 * Check Skill setup.
 */

describe('Check Skill setup:', () => {
	const setup = skill('a')

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
	})
})

/*
 * Check part setup.
 */

describe('Check part setup:', () => {
	const setupAnd = and('a', part('b', 3 / 4))
	const setupOr = or('a', part('b', 3 / 4))

	describe('validation', () => {
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
