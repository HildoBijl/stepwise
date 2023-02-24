const { compareNumbers } = require('../../util/numbers')
const { compareNumberArrays } = require('../../util/arrays')

const { and, or, repeat, pick, part } = require('./implementation')

const dataSet = { a: [1], b: [0, 1] }

/*
 * Check and set-up.
 */

describe('Check and set-up:', () => {
	const setup = and('a', 'b')
	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})
	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('a*b')
			expect(compareNumberArrays(setup.getPolynomialMatrix(), [[0, 0], [0, 1]])).toBe(true)
		})
	})
	describe('getEV', () => {
		it('works correctly', () => {
			expect(compareNumbers(setup.getEV(dataSet), 1 / 3)).toBe(true)
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
 * Check or set-up.
 */

describe('Check or set-up:', () => {
	const setup = or('a', 'b')
	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})
	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('b+a-a*b')
			expect(compareNumberArrays(setup.getPolynomialMatrix(), [[0, 1], [1, -1]])).toBe(true)
		})
	})
	describe('getEV', () => {
		it('works correctly', () => {
			expect(compareNumbers(setup.getEV(dataSet), 5 / 6)).toBe(true)
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
 * Check repeat set-up.
 */

describe('Check repeat set-up:', () => {
	const setup = repeat('b', 3)
	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['b']))
		})
	})
	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('b^3')
			expect(compareNumberArrays(setup.getPolynomialMatrix(), [0, 0, 0, 1])).toBe(true)
		})
	})
	describe('getEV', () => {
		it('works correctly', () => {
			expect(compareNumbers(setup.getEV(dataSet), 8 / 27)).toBe(true)
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
 * Check pick set-up.
 */

describe('Check pick set-up:', () => {
	const setup = pick(['a', 'b'], 1, [3, 1])
	describe('skill lists', () => {
		it('work correctly', () => {
			expect(setup.getSkillList()).toEqual(expect.arrayContaining(['a', 'b']))
		})
	})
	describe('polynomials', () => {
		it('work correctly', () => {
			expect(setup.getPolynomialString()).toBe('0.25*b+0.75*a')
			expect(compareNumberArrays(setup.getPolynomialMatrix(), [[0, 1 / 4], [3 / 4, 0]])).toBe(true)
		})
	})
	describe('getEV:', () => {
		expect(compareNumbers(setup.getEV(dataSet), 13 / 24)).toBe(true)
	})
	describe('processObservation:', () => {
		expect(() => setup.processObservation(dataSet, true)).toThrow()
		expect(() => setup.processObservation(dataSet, false)).toThrow()
	})
})

/*
 * Check part set-up.
 */

describe('Check part set-up:', () => {
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
			expect(compareNumberArrays(setupAnd.getPolynomialMatrix(), [[0, 0], [1 / 4, 3 / 4]])).toBe(true)
			expect(compareNumberArrays(setupOr.getPolynomialMatrix(), [[0, 3 / 4], [1, -3 / 4]])).toBe(true)
		})
	})
	describe('getEV', () => {
		it('works correctly', () => {
			expect(compareNumbers(setupAnd.getEV(dataSet), 3 / 8)).toBe(true)
			expect(compareNumbers(setupOr.getEV(dataSet), 3 / 4)).toBe(true)
		})
	})
	describe('processObservation', () => {
		expect(() => setupAnd.processObservation(dataSet, true)).toThrow()
		expect(() => setupAnd.processObservation(dataSet, false)).toThrow()
		expect(() => setupOr.processObservation(dataSet, true)).toThrow()
		expect(() => setupOr.processObservation(dataSet, false)).toThrow()
	})
})
