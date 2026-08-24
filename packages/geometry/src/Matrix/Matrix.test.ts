import { describe, expect, it } from 'vitest'

import { Matrix, Vector, deserializeMatrix, ensureMatrix, ensureSquareMatrix, isMatrixArray, isMatrixLike, serializeMatrix } from '..'

describe('Matrix', () => {
	it('constructs immutable matrices and exposes rows and columns', () => {
		const rows = [[1, 2], [3, 4]]
		const matrix = new Matrix(rows)
		rows[0]![0] = 9
		const output = matrix.rows
		output[0]![1] = 9
		expect(matrix.rows).toEqual([[1, 2], [3, 4]])
		expect(matrix.rowCount).toBe(2)
		expect(matrix.columnCount).toBe(2)
		expect(matrix.getRow(1).coordinates).toEqual([3, 4])
		expect(matrix.getColumn(0).coordinates).toEqual([1, 3])
	})

	it('recognizes important matrix forms', () => {
		expect(Matrix.getZero(2, 3).isZero()).toBe(true)
		expect(Matrix.identity2D.isIdentity()).toBe(true)
		expect(new Matrix([[0, 0], [0, 2]]).isDiagonal()).toBe(true)
		expect(new Matrix([[1, 0], [2, 3]]).isDiagonal()).toBe(false)
		expect(new Matrix([[0, 2], [3, 0]]).isMonomial()).toBe(true)
		expect(new Matrix([[1, 1], [0, 1]]).isMonomial()).toBe(false)
	})

	it('performs matrix arithmetic', () => {
		const matrix = new Matrix([[1, 2], [3, 4]])
		expect(matrix.add([[4, 3], [2, 1]]).rows).toEqual([[5, 5], [5, 5]])
		expect(matrix.subtract([[1, 1], [1, 1]]).rows).toEqual([[0, 1], [2, 3]])
		expect(matrix.multiply(2).rows).toEqual([[2, 4], [6, 8]])
		expect(matrix.multiply([[2, 0], [1, 2]]).rows).toEqual([[4, 4], [10, 8]])
		expect((matrix.multiply(new Vector(2, 1)) as Vector).coordinates).toEqual([4, 10])
		expect(matrix.transpose().rows).toEqual([[1, 3], [2, 4]])
	})

	it('calculates matrix invariants and inverses', () => {
		const matrix = new Matrix([[4, 7], [2, 6]])
		expect(matrix.trace).toBe(10)
		expect(matrix.determinant).toBe(10)
		expect(matrix.getMinor(0, 0).rows).toEqual([[6]])
		expect(matrix.adjugate.rows).toEqual([[6, -7], [-2, 4]])
		expect(matrix.inverse.multiply(matrix).isIdentity()).toBe(true)
		expect(() => new Matrix([[1, 2], [2, 4]]).inverse).toThrow()
		expect(() => new Matrix([[1, 2, 3], [4, 5, 6]]).determinant).toThrow()
	})

	it('provides matrix factories', () => {
		expect(Matrix.fromDiagonal([2, 0]).rows).toEqual([[2, 0], [0, 0]])
		expect(Matrix.fromColumnVector([1, 2]).rows).toEqual([[1], [2]])
		expect(Matrix.fromColumns([[1, 2], [3, 4]]).rows).toEqual([[1, 3], [2, 4]])
		expect(Matrix.fromRows([[1, 2], [3, 4]]).rows).toEqual([[1, 2], [3, 4]])
		expect(() => Matrix.fromColumns([])).toThrow()
		expect(() => Matrix.fromRows([[1], [2, 3]])).toThrow()
	})

	it('validates and serializes matrices', () => {
		const matrix = new Matrix([[1, 2], [3, 4]])
		expect(isMatrixArray(matrix.rows)).toBe(true)
		expect(isMatrixLike(matrix)).toBe(true)
		expect(ensureMatrix(matrix, { rowCount: 2, columnCount: 2 }).equals(matrix)).toBe(true)
		expect(ensureSquareMatrix(matrix).equals(matrix)).toBe(true)
		expect(Matrix.fromStorageValue(matrix.toStorageValue()).equals(matrix)).toBe(true)
		expect(deserializeMatrix(serializeMatrix(matrix)).equals(matrix)).toBe(true)
		expect(() => ensureMatrix(matrix, { rowCount: 3 })).toThrow()
		expect(() => ensureSquareMatrix([[1, 2, 3], [4, 5, 6]])).toThrow()
	})
})
