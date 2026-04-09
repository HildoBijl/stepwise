import { isNumber } from '@step-wise/utils'

import type { MatrixData, MatrixInput } from './types'

// Check if the given value is a matrix row.
export function isMatrixRow(value: unknown): value is number[] {
	return Array.isArray(value) && value.length > 0 && value.every(item => isNumber(item))
}

// Check if the given value is valid matrix data.
export function isMatrixData(value: unknown): value is MatrixData {
	if (!Array.isArray(value) || value.length === 0) return false
	if (!value.every(isMatrixRow)) return false
	
	const rowLength = value[0].length
	if (rowLength === 0) return false
	return value.every(row => row.length === rowLength)
}

// Check if the given value is matrix input.
export function isMatrixInput(value: unknown): value is MatrixInput {
	return isMatrixData(value)
}
