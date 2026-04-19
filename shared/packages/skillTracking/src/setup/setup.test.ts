import { compareNumbers, compareNumberArrays } from '@step-wise/utils'

import { and, or, repeat, pick, part } from './setups'

const dataSet = { a: [1], b: [0, 1] }

/*
 * Check and setup.
 */

describe('Check and setup:', () => {
	const setup = and('a', 'b')

	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('a*b')
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[][], [[0, 0], [0, 1]])).toBe(true)
		})
	})

	describe('getExpectedValue', () => {
		it('works correctly', () => {
			expect(compareNumbers(setup.getExpectedValue(dataSet), 1 / 3)).toBe(true)
		})
	})

	describe('processObservation', () => {
		it('works correctly', () => {
			const resultOnTrue = setup.processObservation(dataSet, true)
			expect(compareNumberArrays(resultOnTrue.a, [0, 1])).toBe(true)
			expect(compareNumberArrays(resultOnTrue.b, [0, 0, 1])).toBe(true)

			const resultOnFalse = setup.processObservation(dataSet, false)
			expect(compareNumberArrays(resultOnFalse.a, [3 / 4, 1 / 4])).toBe(true)
			expect(compareNumberArrays(resultOnFalse.b, [0, 1 / 2, 1 / 2])).toBe(true)
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
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('b+a-a*b')
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[][], [[0, 1], [1, -1]])).toBe(true)
		})
	})

	describe('getExpectedValue', () => {
		it('works correctly', () => {
			expect(compareNumbers(setup.getExpectedValue(dataSet), 5 / 6)).toBe(true)
		})
	})

	describe('processObservation', () => {
		it('works correctly', () => {
			const resultOnTrue = setup.processObservation(dataSet, true)
			expect(compareNumberArrays(resultOnTrue.a, [2 / 5, 3 / 5])).toBe(true)
			expect(compareNumberArrays(resultOnTrue.b, [0, 1 / 5, 4 / 5])).toBe(true)

			const resultOnFalse = setup.processObservation(dataSet, false)
			expect(compareNumberArrays(resultOnFalse.a, [1, 0])).toBe(true)
			expect(compareNumberArrays(resultOnFalse.b, [0, 1, 0])).toBe(true)
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
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('b^3')
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[], [0, 0, 0, 1])).toBe(true)
		})
	})

	describe('getExpectedValue', () => {
		it('works correctly', () => {
			expect(compareNumbers(setup.getExpectedValue(dataSet), 8 / 27)).toBe(true)
		})
	})

	describe('processObservation', () => {
		it('works correctly', () => {
			const resultOnTrue = setup.processObservation(dataSet, true)
			expect(resultOnTrue.a).toBe(undefined)
			expect(compareNumberArrays(resultOnTrue.b, [0, 0, 0, 0, 1])).toBe(true)

			const resultOnFalse = setup.processObservation(dataSet, false)
			expect(resultOnFalse.a).toBe(undefined)
			expect(compareNumberArrays(resultOnFalse.b, [0, 1 / 6, 1 / 3, 1 / 2, 0])).toBe(true)
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
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})

	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('0.25*b+0.75*a')
			expect(compareNumberArrays(setup.getPolynomialMatrix() as number[][], [[0, 1 / 4], [3 / 4, 0]])).toBe(true)
		})
	})

	describe('getExpectedValue', () => {
		it('works correctly', () => {
			expect(compareNumbers(setup.getExpectedValue(dataSet), 13 / 24)).toBe(true)
		})
	})

	describe('processObservation', () => {
		it('throws correctly', () => {
			expect(() => setup.processObservation(dataSet, true)).toThrow()
			expect(() => setup.processObservation(dataSet, false)).toThrow()
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
			expect(setupAnd.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
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

	describe('getExpectedValue', () => {
		it('works correctly', () => {
			expect(compareNumbers(setupAnd.getExpectedValue(dataSet), 3 / 8)).toBe(true)
			expect(compareNumbers(setupOr.getExpectedValue(dataSet), 3 / 4)).toBe(true)
		})
	})

	describe('processObservation', () => {
		it('throws correctly', () => {
			expect(() => setupAnd.processObservation(dataSet, true)).toThrow()
			expect(() => setupAnd.processObservation(dataSet, false)).toThrow()
			expect(() => setupOr.processObservation(dataSet, true)).toThrow()
			expect(() => setupOr.processObservation(dataSet, false)).toThrow()
		})
	})
})
