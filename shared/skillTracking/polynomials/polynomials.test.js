const { compareNumberArrays } = require('../../util')

const { applyMinus, addConstant, multiplyByConstant, oneMinus, add, multiply } = require('./addAndMultiply')
const { restructure, substitute, substituteAll } = require('./restructureAndSubstitute')
const { polynomialMatrixToString } = require('./display')

/*
 * Check mathematical functions.
 */

describe('Check mathematical functions:', () => {
	describe('applyMinus', () => {
		it('works correctly', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = applyMinus(matrix)
			const result = [[-2, -3], [-4, -5]]
			expect(compareNumberArrays(applied, result)).toBe(true)
		})
	})
	describe('addConstant', () => {
		it('works correctly', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = addConstant(matrix, 6)
			const result = [[8, 3], [4, 5]]
			expect(compareNumberArrays(applied, result)).toBe(true)
		})
	})
	describe('multiplyByConstant', () => {
		it('works correctly', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = multiplyByConstant(matrix, 3)
			const result = [[6, 9], [12, 15]]
			expect(compareNumberArrays(applied, result)).toBe(true)
		})
	})
	describe('oneMinus', () => {
		it('works correctly', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = oneMinus(matrix)
			const result = [[-1, -3], [-4, -5]]
			expect(compareNumberArrays(applied, result)).toBe(true)
		})
	})
	describe('add', () => {
		it('works correctly', () => {
			const matrix1 = [[2, 3], [4, 5]]
			const matrix2 = [6, 7]
			const list1 = ['a', 'b']
			const applied1 = add([matrix1, matrix2], [list1, ['b']])
			const result1 = [[8, 10], [4, 5]]
			expect(applied1.list).toEqual(expect.arrayContaining(list1))
			expect(compareNumberArrays(applied1.matrix, result1)).toBe(true)

			const applied2 = add([matrix1, matrix2], [list1, ['a']])
			const result2 = [[8, 3], [11, 5]]
			expect(applied2.list).toEqual(expect.arrayContaining(list1))
			expect(compareNumberArrays(applied2.matrix, result2)).toBe(true)
		})
	})
	describe('multiply', () => {
		it('works correctly', () => {
			const matrix1 = [[2, 3], [4, 5]]
			const matrix2 = [6, 7]
			const list1 = ['a', 'b']
			const applied1 = multiply([matrix1, matrix2], [list1, ['b']])
			const result1 = [[12, 32, 21], [24, 58, 35]]
			expect(applied1.list).toEqual(expect.arrayContaining(list1))
			expect(compareNumberArrays(applied1.matrix, result1)).toBe(true)

			const applied2 = multiply([matrix1, matrix2], [list1, ['a']])
			const result2 = [[12, 18], [38, 51], [28, 35]]
			expect(applied2.list).toEqual(expect.arrayContaining(list1))
			expect(compareNumberArrays(applied2.matrix, result2)).toBe(true)
		})
	})
})

/*
 * Check restructure/substitute functions.
 */

describe('Check restructure/substitute functions:', () => {
	describe('restructure', () => {
		it('works correctly on equally sized lists', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = restructure(matrix, ['a', 'b'], ['b', 'a'])
			const result = [[2, 4], [3, 5]]
			expect(compareNumberArrays(applied, result)).toBe(true)
		})
		it('works correctly on unequally sized lists', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = restructure(matrix, ['a', 'b'], ['c', 'b', 'a'])
			const result = [[[2, 4], [3, 5]]]
			expect(compareNumberArrays(applied, result)).toBe(true)
		})
		it('throws an error when non-simple variables are dropped', () => {
			const matrix = [[2, 3], [4, 5]]
			expect(() => restructure(matrix, ['a', 'b'], ['b', 'c'])).toThrow()
		})
		it('allows dropping of non-present variables', () => {
			const matrix = [[2, 3]]
			expect(() => restructure(matrix, ['a', 'b'], ['b', 'c'])).not.toThrow()
		})
	})

	describe('substitute', () => {
		it('works correctly when substituting part of the variables', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = substitute(matrix, ['a', 'b'], { a: 3 })
			const result = [14, 18]
			expect(applied.list).toEqual(expect.arrayContaining(['b']))
			expect(compareNumberArrays(applied.matrix, result)).toBe(true)
		})
		it('works correctly when substituting all of the variables', () => {
			const matrix = [[2, 3], [4, 5]]
			const applied = substitute(matrix, ['a', 'b'], { a: 3, b: 2 })
			expect(applied.list.length).toBe(0)
			expect(applied.matrix).toBe(50)
		})
	})

	describe('substituteAll', () => {
		it('works correctly', () => {
			const matrix = [[2, 3], [4, 5]]
			expect(substituteAll(matrix, [3, 2])).toBe(50)
		})
	})
})

/*
 * Check display functions.
 */

describe('Check restructure/substitute functions:', () => {
	describe('polynomialMatrixToString', () => {
		it('works correctly when given variables', () => {
			const matrix = [[2, 3], [4, 5]]
			expect(polynomialMatrixToString(matrix, ['x', 'y'])).toBe('2+3*y+4*x+5*x*y')
		})
		it('works correctly when not given variables', () => {
			const matrix = [[2, 3], [4, 5]]
			expect(polynomialMatrixToString(matrix)).toBe('2+3*b+4*a+5*a*b')
		})
	})
})
