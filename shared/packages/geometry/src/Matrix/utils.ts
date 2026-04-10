import { isMatrixInput } from './support'
import { type MatrixLike, Matrix } from './Matrix'

// Check if the given value is something that can be interpreted as a Matrix.
export function isMatrixLike(value: unknown): value is MatrixLike {
	return value instanceof Matrix || isMatrixInput(value)
}

// Turn into a Matrix (with optional property requirements) or throw an error.
export function ensureMatrix(matrix: MatrixLike, rowCount?: number, columnCount?: number): Matrix {
	const ensuredMatrix = new Matrix(matrix)
	if (rowCount !== undefined && ensuredMatrix.height !== rowCount) throw new Error(`Invalid Matrix row count: expected ${rowCount} rows but received ${ensuredMatrix.height}.`)
	if (columnCount !== undefined && ensuredMatrix.width !== columnCount) throw new Error(`Invalid Matrix column count: expected ${columnCount} columns but received ${ensuredMatrix.width}.`)
	return ensuredMatrix
}

// Turn into a square matrix or throw an error.
export function ensureSquareMatrix(matrix: MatrixLike): Matrix {
	const ensuredMatrix = new Matrix(matrix)
	if (!ensuredMatrix.isSquare()) throw new Error(`Invalid Matrix: expected a square matrix but received a ${ensuredMatrix.height} by ${ensuredMatrix.width} matrix.`)
	return ensuredMatrix
}
