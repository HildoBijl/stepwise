import { PolynomialMatrix } from './types'

// Extract the dimensions of a given PolynomialMatrix.
export function getPolynomialDimensions(matrix: PolynomialMatrix): number[] {
	const dimensions: number[] = []
	let current: PolynomialMatrix = matrix
	while (Array.isArray(current)) {
		dimensions.push(current.length)
		current = current[0] as PolynomialMatrix
	}
	return dimensions
}

// Extract a single coefficient from a PolynomialMatrix based on a list of indices.
export function getPolynomialCoefficient(matrix: PolynomialMatrix, indices: readonly number[]): number
export function getPolynomialCoefficient(matrix: PolynomialMatrix, indices: readonly number[], allowOutOfBounds: true): number | undefined
export function getPolynomialCoefficient(matrix: PolynomialMatrix, indices: readonly number[], allowOutOfBounds?: false): number
export function getPolynomialCoefficient(matrix: PolynomialMatrix, indices: readonly number[], allowOutOfBounds = false): number | undefined {
	let result = matrix
	for (const index of indices) {
		if (!Array.isArray(result)) {
			if (allowOutOfBounds) return undefined
			throw new RangeError(`Invalid polynomial coefficient access: expected an array while following indices ${indices.join(',')}.`)
		}
		if (index < 0 || index >= result.length) {
			if (allowOutOfBounds) return undefined
			throw new RangeError(`Invalid polynomial coefficient access: index ${index} is out of bounds.`)
		}
		result = result[index]
	}
	if (Array.isArray(result)) throw new RangeError(`Invalid polynomial coefficient access: indices ${indices.join(',')} do not identify a coefficient.`)
	return result
}
