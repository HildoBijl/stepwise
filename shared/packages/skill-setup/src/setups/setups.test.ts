import { compareNumberArrays } from '@step-wise/utils'

import { skill, and, or, repeat, pick, part } from './index'

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
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[], [0, 1])).toBe(true)
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
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[][], [[0, 0], [0, 1]])).toBe(true)
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
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[][], [[0, 1], [1, -1]])).toBe(true)
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
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[], [0, 0, 0, 1])).toBe(true)
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
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[][], [[0, 1 / 4], [3 / 4, 0]])).toBe(true)
		})
	})
})

/*
 * Check part setup.
 */

describe('Check part setup:', () => {
	const setupAnd = and('a', part('b', 3 / 4))
	const setupOr = or('a', part('b', 3 / 4))

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
			expect(compareNumberArrays(setupAnd.getPolynomialMatrix() as number[][], [[0, 0], [1 / 4, 3 / 4]])).toBe(true)
			expect(compareNumberArrays(setupOr.getPolynomialMatrix() as number[][], [[0, 3 / 4], [1, -3 / 4]])).toBe(true)
		})
	})
})
