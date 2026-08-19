import { describe, expect, it } from 'vitest'

import { getDimensions, getMatrixElement } from './multidimensional'

const isNumber = (value: unknown): value is number => typeof value === 'number'

describe('multidimensional arrays', () => {
	it('gets scalar and rectangular dimensions', () => {
		expect(getDimensions(2, isNumber)).toEqual([])
		expect(getDimensions([[1, 2], [3, 4]], isNumber)).toEqual([2, 2])
		expect(getDimensions([], isNumber)).toEqual([0])
		expect(() => getDimensions([[1], [2, 3]], isNumber)).toThrow(RangeError)
		expect(() => getDimensions([1, '2'] as never, isNumber)).toThrow(TypeError)
	})

	it('gets guarded matrix elements', () => {
		const matrix = [[1, 2], [3, 4]]
		expect(getMatrixElement(matrix, [1, 0], isNumber)).toBe(3)
		expect(getMatrixElement(matrix, [3, 0], isNumber, { allowOutOfBounds: true })).toBeUndefined()
		expect(() => getMatrixElement(matrix, [3], isNumber)).toThrow(RangeError)
		expect(() => getMatrixElement(matrix, [0], isNumber)).toThrow(RangeError)
		expect(() => getMatrixElement(matrix, [-1], isNumber)).toThrow(RangeError)
	})
})
