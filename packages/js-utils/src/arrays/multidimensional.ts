import { type TypeGuard } from '../objects'

import { type NestedArray } from './finding'
import { type ArrayReadingOptions } from './reading'

export type NestedValue<T> = T | NestedArray<T>

// Get the dimensions of a multi-dimensional array (matrix).
export function getDimensions<T>(matrix: NestedValue<T>, isElement: TypeGuard<T>): number[] {
	if (isElement(matrix)) return []
	if (!Array.isArray(matrix)) throw new TypeError('Invalid matrix: encountered a value that is neither a nested array nor a valid element.')
	if (matrix.length === 0) return [0]

	const childDimensions = matrix.map(child => getDimensions(child, isElement))
	const expectedDimensions = childDimensions[0]
	if (childDimensions.some(dimensions => dimensions.length !== expectedDimensions.length || dimensions.some((size, index) => size !== expectedDimensions[index]))) {
		throw new RangeError('Invalid matrix: expected a rectangular nested array with a consistent depth.')
	}
	return [matrix.length, ...expectedDimensions]
}

// Get an element from a matrix using a list of indices.
export function getMatrixElement<T>(matrix: NestedValue<T>, indices: readonly number[], isElement: TypeGuard<T>): T
export function getMatrixElement<T>(matrix: NestedValue<T>, indices: readonly number[], isElement: TypeGuard<T>, options: ArrayReadingOptions & { allowOutOfBounds: true }): T | undefined
export function getMatrixElement<T>(matrix: NestedValue<T>, indices: readonly number[], isElement: TypeGuard<T>, options?: ArrayReadingOptions & { allowOutOfBounds?: false }): T
export function getMatrixElement<T>(matrix: NestedValue<T>, indices: readonly number[], isElement: TypeGuard<T>, options: ArrayReadingOptions = {}): T | undefined {
	const { allowOutOfBounds = false } = options
	let result: NestedValue<T> = matrix
	for (const index of indices) {
		if (!Number.isSafeInteger(index) || index < 0) throw new RangeError(`Invalid matrix access: index ${index} must be a non-negative safe integer.`)
		if (isElement(result)) {
			if (allowOutOfBounds) return undefined
			throw new RangeError(`Invalid matrix access: expected an array while following indices ${indices.join(',')}.`)
		}
		if (!Array.isArray(result)) throw new TypeError('Invalid matrix access: encountered a value that is neither a nested array nor a valid element.')
		if (index < 0 || index >= result.length) {
			if (allowOutOfBounds) return undefined
			throw new RangeError(`Invalid matrix access: index ${index} is out of bounds.`)
		}
		result = result[index]
	}
	if (!isElement(result)) throw new RangeError(`Invalid matrix access: indices ${indices.join(',')} do not identify a valid element.`)
	return result
}
