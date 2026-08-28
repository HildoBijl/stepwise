import { isMatrixInput } from './support.ts'
import { type MatrixLike, Matrix } from './Matrix.ts'

// Check if the given value is something that can be interpreted as a Matrix.
export function isMatrixLike(value: unknown): value is MatrixLike {
	return value instanceof Matrix || isMatrixInput(value)
}

// Turn into a Matrix (with optional property requirements) or throw an error.
export function ensureMatrix(matrix: MatrixLike, options: { rowCount?: number, columnCount?: number } = {}): Matrix {
	const ensuredMatrix = new Matrix(matrix)
	if (options.rowCount !== undefined && ensuredMatrix.rowCount !== options.rowCount) throw new Error(`Invalid Matrix row count: expected ${options.rowCount} rows but received ${ensuredMatrix.rowCount}.`)
	if (options.columnCount !== undefined && ensuredMatrix.columnCount !== options.columnCount) throw new Error(`Invalid Matrix column count: expected ${options.columnCount} columns but received ${ensuredMatrix.columnCount}.`)
	return ensuredMatrix
}

// Turn into a square matrix or throw an error.
export function ensureSquareMatrix(matrix: MatrixLike): Matrix {
	const ensuredMatrix = new Matrix(matrix)
	if (!ensuredMatrix.isSquare()) throw new Error(`Invalid Matrix: expected a square matrix but received a ${ensuredMatrix.rowCount} by ${ensuredMatrix.columnCount} matrix.`)
	return ensuredMatrix
}
