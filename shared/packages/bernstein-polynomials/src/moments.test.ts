import { compareNumbers } from '@step-wise/utils'

import { getBernsteinExpectedValue, getBernsteinVariance, getBernsteinMoment } from './moments'

describe('Check moment functions:', () => {
	describe('getBernsteinExpectedValue', () => {
		it('gives correct values', () => {
			expect(getBernsteinExpectedValue([0, 1])).toBe(2 / 3)
			expect(getBernsteinExpectedValue([0, 0, 1, 0])).toBe(3 / 5)
		})
	})

	describe('getBernsteinMoment', () => {
		it('gives correct values', () => {
			expect(getBernsteinMoment([0, 1], 2)).toBe(1 / 2)
			expect(getBernsteinMoment([0, 1], 3)).toBe(2 / 5)
			expect(getBernsteinMoment([0, 0, 1, 0], 2)).toBe(2 / 5)
			expect(getBernsteinMoment([0, 0, 1, 0], 3)).toBe(2 / 7)
		})
	})

	describe('getBernsteinVariance', () => {
		it('gives correct values', () => {
			expect(compareNumbers(getBernsteinVariance([0, 1]), 1 / 18)).toBe(true)
			expect(compareNumbers(getBernsteinVariance([0, 0, 1, 0]), 1 / 25)).toBe(true)
		})
	})
})
