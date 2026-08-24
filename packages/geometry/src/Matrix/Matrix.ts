import { ensureInteger, ensureNumber, approximatelyEqual, count } from '@step-wise/js-utils'

import { type VectorLike, isVectorLike, Vector, ensureVector } from '../Vector'

import type { MatrixArray, MatrixInput } from './types'
import { isMatrixArray } from './support'

export const MatrixType = 'Matrix'
export type MatrixType = typeof MatrixType

export type { MatrixArray as MatrixStorageValue }
export type MatrixLike = Matrix | MatrixInput

export class Matrix {
	private readonly _rows: MatrixArray

	/*
	 * Common matrices.
	 */

	static readonly identity2D = Matrix.getIdentity(2)
	static readonly identity3D = Matrix.getIdentity(3)

	/*
	 * Constructor.
	 */

	constructor(input: MatrixLike)
	constructor(...rows: MatrixArray)
	constructor(...args: [MatrixLike] | MatrixArray) {
		// Check for empty input.
		if (args.length === 0) throw new Error(`Invalid Matrix: the Matrix constructor was called without input.`)

		// Handle constructor(MatrixLike).
		if (args.length === 1) {
			const value = args[0]

			// On a Matrix, become it.
			if (value instanceof Matrix) {
				this._rows = value.rows
				return
			}

			// On a 2D array, check values and apply.
			if (isMatrixArray(value)) {
				this._rows = value.map(row => row.map(entry => ensureNumber(entry)))
				return
			}

			throw new Error(`Invalid Matrix: expected an array of rows or some other Matrix-like object but received something of type "${typeof value}".`)
		}

		// Handle constructor(...rows).
		if (!isMatrixArray(args)) throw new Error(`Invalid Matrix: expected matrix rows of equal length.`)
		this._rows = args.map(row => row.map(entry => ensureNumber(entry)))
	}

	/*
	 * Fundamentals.
	 */

	static readonly type = MatrixType

	get type(): string {
		return (this.constructor as typeof Matrix).type
	}

	get rows(): MatrixArray {
		return this._rows.map(row => [...row])
	}

	clone(): Matrix {
		return new Matrix(this._rows)
	}

	toStorageValue(): MatrixArray {
		return this.rows
	}

	static fromStorageValue(rows: MatrixArray): Matrix {
		return new Matrix(rows)
	}

	/*
	 * Argument checks.
	 */

	private ensureValidRowIndex(index: number): number {
		index = ensureInteger(index)
		if (index < 0) throw new Error(`Invalid matrix row index: the index cannot be negative. However, ${index} was received.`)
		if (index >= this.rowCount) throw new Error(`Invalid matrix row index: the index cannot be larger than the number of rows. However, ${index} was received for a matrix with ${this.rowCount} rows.`)
		return index
	}

	private ensureValidColumnIndex(index: number): number {
		index = ensureInteger(index)
		if (index < 0) throw new Error(`Invalid matrix column index: the index cannot be negative. However, ${index} was received.`)
		if (index >= this.columnCount) throw new Error(`Invalid matrix column index: the index cannot be larger than the number of columns. However, ${index} was received for a matrix with ${this.columnCount} columns.`)
		return index
	}

	private ensureValidIndices(row: number, column: number): [number, number] {
		return [this.ensureValidRowIndex(row), this.ensureValidColumnIndex(column)]
	}

	private coerceMatrix(value: MatrixLike, rowCount?: number, columnCount?: number): Matrix {
		const matrix = new Matrix(value)
		if (rowCount !== undefined && matrix.rowCount !== rowCount) throw new Error(`Invalid Matrix size: expected a matrix with ${rowCount} rows but received a matrix with ${matrix.rowCount} rows.`)
		if (columnCount !== undefined && matrix.columnCount !== columnCount) throw new Error(`Invalid Matrix size: expected a matrix with ${columnCount} columns but received a matrix with ${matrix.columnCount} columns.`)
		return matrix
	}

	/*
	 * Entry access.
	 */

	getEntry(row: number, column: number): number {
		const [safeRow, safeColumn] = this.ensureValidIndices(row, column)
		return this._rows[safeRow]![safeColumn]!
	}

	getRow(index: number): Vector {
		const safeIndex = this.ensureValidRowIndex(index)
		return new Vector(this._rows[safeIndex]!)
	}

	getColumn(index: number): Vector {
		const safeIndex = this.ensureValidColumnIndex(index)
		return new Vector(this._rows.map(row => row[safeIndex]!))
	}

	/*
	 * Derived properties.
	 */

	get rowCount(): number {
		return this._rows.length
	}

	get columnCount(): number {
		return this._rows[0]!.length
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return `[${this._rows.map(row => `[${row.join(', ')}]`).join(', ')}]`
	}

	/*
	 * Checks.
	 */

	isSquare(): boolean {
		return this.rowCount === this.columnCount
	}

	isZero(): boolean {
		return this._rows.every(row => row.every(value => approximatelyEqual(value, 0)))
	}

	isIdentity(): boolean {
		return this.isSquare() && this._rows.every((row, rowIndex) => row.every((value, colIndex) => approximatelyEqual(value, rowIndex === colIndex ? 1 : 0)))
	}

	// Check whether every off-diagonal entry is zero.
	isDiagonal(): boolean {
		return this.isSquare() && this._rows.every((row, rowIndex) => row.every((value, columnIndex) => rowIndex === columnIndex || approximatelyEqual(value, 0)))
	}

	// Check if every row/column has exactly one non-zero entry.
	isMonomial(): boolean {
		return this.isSquare() && this._rows.every(row => count(row, value => !approximatelyEqual(value, 0)) === 1) && this.transpose()._rows.every(column => count(column, value => !approximatelyEqual(value, 0)) === 1)
	}

	/*
	 * Comparisons.
	 */

	equals(matrix: MatrixLike): boolean {
		const other = this.coerceMatrix(matrix)
		if (this.rowCount !== other.rowCount) return false
		if (this.columnCount !== other.columnCount) return false
		return this._rows.every((row, rowIndex) => row.every((value, columnIndex) => approximatelyEqual(value, other.getEntry(rowIndex, columnIndex))))
	}

	/*
	 * Operations.
	 */

	add(matrix: MatrixLike): Matrix {
		const other = this.coerceMatrix(matrix, this.rowCount, this.columnCount)
		return new Matrix(this._rows.map((row, rowIndex) => row.map((value, columnIndex) => value + other.getEntry(rowIndex, columnIndex))))
	}

	subtract(matrix: MatrixLike): Matrix {
		return this.add(this.coerceMatrix(matrix, this.rowCount, this.columnCount).multiply(-1))
	}

	multiply(scalar: number): Matrix
	multiply(matrix: MatrixLike): Matrix
	multiply(vector: VectorLike): Vector
	multiply(value: number | MatrixLike | VectorLike): Matrix | Vector {
		// On a number, multiply element-wise.
		if (typeof value === 'number') {
			const scalar = ensureNumber(value)
			return new Matrix(this._rows.map(row => row.map(entry => entry * scalar)))
		}

		// On a Vector, set up the output vector.
		if (isVectorLike(value)) {
			const vector = ensureVector(value, { dimension: this.columnCount })
			return new Vector(this._rows.map(row => new Vector(row).dotProduct(vector)))
		}

		// On a matrix, multiply the matrices.
		const other = this.coerceMatrix(value, this.columnCount)
		return new Matrix(this._rows.map((_, rowIndex) => new Array(other.columnCount).fill(0).map((_, columnIndex) => this.getRow(rowIndex).dotProduct(other.getColumn(columnIndex)))))
	}

	divide(scalar: number): Matrix {
		return this.multiply(1 / ensureNumber(scalar, { nonZero: true }))
	}

	transpose(): Matrix {
		return new Matrix(new Array(this.columnCount).fill(0).map((_, columnIndex) => this._rows.map(row => row[columnIndex]!)))
	}

	get trace(): number {
		if (!this.isSquare()) throw new Error(`Invalid trace call: can only take the trace of a square matrix.`)
		return this._rows.reduce((sum, row, index) => sum + row[index]!, 0)
	}

	get determinant(): number {
		if (!this.isSquare()) throw new Error(`Invalid determinant call: can only take the determinant of a square matrix.`)

		// Base cases.
		if (this.rowCount === 1) return this.getEntry(0, 0)
		if (this.rowCount === 2) return this.getEntry(0, 0) * this.getEntry(1, 1) - this.getEntry(0, 1) * this.getEntry(1, 0)

		// Laplace expansion along the first row.
		return this._rows[0]!.reduce((sum, value, columnIndex) => sum + (columnIndex % 2 === 0 ? 1 : -1) * value * this.getMinor(0, columnIndex).determinant, 0)
	}

	getMinor(rowToRemove: number, columnToRemove: number): Matrix {
		this.ensureValidIndices(rowToRemove, columnToRemove)
		return new Matrix(this._rows.filter((_, rowIndex) => rowIndex !== rowToRemove).map(row => row.filter((_, columnIndex) => columnIndex !== columnToRemove)))
	}

	isInvertible(): boolean {
		return !approximatelyEqual(this.determinant, 0)
	}

	get adjugate(): Matrix {
		if (!this.isSquare()) throw new Error(`Invalid adjugate call: can only take the adjugate of a square matrix.`)
		if (this.rowCount === 1) return new Matrix([[1]])
		return new Matrix(this._rows.map((row, rowIndex) => row.map((_, columnIndex) => ((rowIndex + columnIndex) % 2 === 0 ? 1 : -1) * this.getMinor(rowIndex, columnIndex).determinant))).transpose()
	}

	get inverse(): Matrix {
		if (!this.isSquare()) throw new Error(`Invalid inverse call: can only invert a square matrix.`)
		if (!this.isInvertible()) throw new Error(`Invalid inverse call: cannot invert a matrix with determinant 0.`)
		return this.adjugate.divide(this.determinant)
	}

	/*
	 * Static creation methods.
	 */

	static getZero(rowCount: number, columnCount = rowCount): Matrix {
		rowCount = ensureInteger(rowCount, { nonNegative: true, nonZero: true })
		columnCount = ensureInteger(columnCount, { nonNegative: true, nonZero: true })
		return new Matrix(new Array(rowCount).fill(0).map(() => new Array(columnCount).fill(0)))
	}

	static fromDiagonal(diagonal: VectorLike): Matrix {
		const vector = ensureVector(diagonal)
		return new Matrix(new Array(vector.dimension).fill(0).map((_, rowIndex) => new Array(vector.dimension).fill(0).map((_, columnIndex) => (rowIndex === columnIndex ? vector.getCoordinate(rowIndex) : 0))))
	}

	static getIdentity(size: number): Matrix {
		size = ensureInteger(size, { nonNegative: true, nonZero: true })
		return Matrix.fromDiagonal(new Array(size).fill(1))
	}

	static fromColumnVector(vector: VectorLike): Matrix {
		return new Matrix(ensureVector(vector).coordinates.map(value => [value]))
	}

	static fromColumns(columns: VectorLike[]): Matrix {
		if (!Array.isArray(columns) || columns.length === 0) throw new Error(`Invalid fromColumns call: expected a non-empty array of column vectors.`)
		const vectors = columns.map(column => ensureVector(column))
		const dimension = vectors[0]!.dimension
		if (vectors.some(vector => vector.dimension !== dimension)) throw new Error(`Invalid fromColumns call: all columns must have the same dimension.`)
		return new Matrix(new Array(dimension).fill(0).map((_, rowIndex) => vectors.map(vector => vector.getCoordinate(rowIndex))))
	}

	static fromRows(rows: VectorLike[]): Matrix {
		if (!Array.isArray(rows) || rows.length === 0) throw new Error(`Invalid fromRows call: expected a non-empty array of row vectors.`)
		const vectors = rows.map(row => ensureVector(row))
		const dimension = vectors[0]!.dimension
		if (vectors.some(vector => vector.dimension !== dimension)) throw new Error(`Invalid fromRows call: all rows must have the same dimension.`)
		return new Matrix(vectors.map(vector => vector.coordinates))
	}
}
