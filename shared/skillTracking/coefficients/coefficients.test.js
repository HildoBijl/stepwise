const { compareNumberArrays } = require('../../util/arrays')

const { ensureCoef, getOrder, normalize } = require('./fundamentals')
const { getPDF } = require('./distributions')
const { getEV, getMoment } = require('./moments')
const { merge, mergeElementwise } = require('./merging')
const { smoothenWithFactor } = require('./smoothing')

/*
 * Check fundamental functions.
 */

describe('Check fundamental functions:', () => {
	describe('ensureCoef', () => {
		it('throws an error on non-array coefficients', () => {
			expect(() => ensureCoef(1)).toThrow()
		})
		it('throws an error on non-normalized coefficients', () => {
			expect(() => ensureCoef([1, 1])).toThrow()
		})
		it('passes on valid coefficient arrays', () => {
			const coef = [0.1, 0.3, 0.6]
			expect(compareNumberArrays(ensureCoef(coef), coef)).toBe(true)
		})
	})

	describe('getOrder', () => {
		it('gives the correct order on a coefficient array', () => {
			expect(getOrder([0.1, 0.2, 0.3, 0.4])).toBe(3)
		})
	})

	describe('normalize', () => {
		it('properly normalizes an array', () => {
			expect(compareNumberArrays(normalize([1, 2, 3, 4]), [0.1, 0.2, 0.3, 0.4])).toBe(true)
		})
	})
})

/*
 * Check functions around distributions.
 */

describe('Check distribution functions:', () => {
	describe('getPDF', () => {
		it('gives a correct PDF', () => {
			const pdf = getPDF([0, 0, 1, 0]) // 12*x^2*(1-x).
			expect(() => pdf(-1)).toThrow()
			expect(() => pdf(2)).toThrow()
			expect(pdf(0)).toBe(0)
			expect(pdf(1)).toBe(0)
			expect(pdf(0.5)).toBe(1.5)
		})
	})
})

/*
 * Check functions about moments.
 */

describe('Check moment functions:', () => {
	describe('getEV', () => {
		it('gives correct values', () => {
			expect(getEV([0, 1])).toBe(2 / 3)
			expect(getEV([0, 0, 1, 0])).toBe(3 / 5)
		})
	})
	describe('getMoment', () => {
		it('gives correct values', () => {
			expect(getMoment([0, 1], 2)).toBe(1 / 2)
			expect(getMoment([0, 1], 3)).toBe(2 / 5)
			expect(getMoment([0, 0, 1, 0], 2)).toBe(2 / 5)
			expect(getMoment([0, 0, 1, 0], 3)).toBe(2 / 7)
		})
	})
	describe('getVariance', () => {
		it('gives correct values', () => {
			expect(getVariance([0, 1])).toBe(1 / 18)
			expect(getVariance([0, 0, 1, 0])).toBe(1 / 25)
		})
	})
})

/*
 * Check merging functions.
 */

describe('Check merging functions:', () => {
	describe('merge', () => {
		it('correctly merges distributions', () => {
			expect(compareNumberArrays(merge([[0, 1], [1, 0]]), [0, 1, 0])).toBe(true)
			expect(compareNumberArrays(merge([[2 / 5, 3 / 5], [0, 1]]), [0, 1 / 4, 3 / 4])).toBe(true)
		})
	})

	describe('mergeElementwise', () => {
		it('correctly merges element-wise', () => {
			expect(compareNumberArrays(mergeElementwise([[0.2, 0.8], [0.8, 0.2]]), [0.5, 0.5])).toBe(true)
			expect(compareNumberArrays(mergeElementwise([[3 / 7, 4 / 7], [3 / 7, 4 / 7]]), [9 / 25, 16 / 25])).toBe(true)
		})
		it('throws on coefficient lists of unequal size', () => {
			expect(() => mergeElementwise([[0, 1], [1]])).toThrow()
		})
	})
})

/*
 * Check smoothing functions.
 */

describe('Check smoothing functions:', () => {
	describe('smoothen', () => {
		it('correctly smoothes distributions', () => {
			expect(compareNumberArrays(smoothenWithFactor([0, 1], 1 / 2), [1 / 6, 1 / 3, 1 / 2])).toBe(true)
			expect(compareNumberArrays(smoothenWithFactor([0, 1 / 3, 2 / 3], 3 / 4), [5 / 140, 10 / 140, 15 / 140, 20 / 140, 25 / 140, 30 / 140, 35 / 140])).toBe(true)
		})
	})
})
