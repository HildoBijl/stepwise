import { ensureInt, sum, getDimensions, getMatrixElement, repeat, repeatMultidimensional, repeatMultidimensionalFromTo, union } from '@step-wise/utils'

import { PolynomialMatrix, VariableList, PolynomialExpression } from './types'
import { restructure } from './restructureAndSubstitute'

// Apply a minus sign to all elements of a polynomial matrix.
export function applyMinus(matrix: PolynomialMatrix): PolynomialMatrix {
	return matrix.map(submatrix => Array.isArray(submatrix) ? applyMinus(submatrix) : -submatrix)
}

// Add a constant to a polynomial.
export function addConstant(matrix: PolynomialMatrix, addition: number): PolynomialMatrix {
	return Array.isArray(matrix[0]) ? [addConstant(matrix[0], addition), ...matrix.slice(1)] : [matrix[0] as number + addition, ...matrix.slice(1)]
}

// Multiply all matrix elements by a constant.
export function multiplyByConstant(matrix: PolynomialMatrix, multiplication: number): PolynomialMatrix {
	return matrix.map(submatrix => Array.isArray(submatrix) ? multiplyByConstant(submatrix, multiplication) : submatrix as number * multiplication)
}

// Return one minus the given polynomial.
export function oneMinus(matrix: PolynomialMatrix): PolynomialMatrix {
	return addConstant(applyMinus(matrix), 1)
}

// Add matrices of equal variable dimension.
function addWithEqualDimension(matrices: PolynomialMatrix[]): PolynomialMatrix {
	const matrixDimensions = matrices.map(matrix => getDimensions(matrix))
	if (matrixDimensions.some(dimensions => dimensions.length !== matrixDimensions[0].length)) throw new Error(`Invalid polynomial matrix sizes: tried to add polynomial matrices that had different dimensions. Dimensions were [${matrixDimensions.map(dimensions => dimensions.length).join(',')}].`)
	const dimensions = repeat(matrixDimensions[0].length, index => Math.max(...matrixDimensions.map(dimensions => dimensions[index])))
	return repeatMultidimensional(dimensions, (...indices) => sum(matrices.map(matrix => getMatrixElement(matrix, indices, true) ?? 0)))
}

// Add matrices with variable lists. Returns { matrix, list }.
export function add(expressions: PolynomialExpression[], destinationList?: VariableList): PolynomialExpression {
	destinationList ??= [...union(...expressions.map(expression => new Set(expression.list)))]
	const restructuredMatrices = expressions.map(expression => restructure(expression.matrix, expression.list, destinationList))
	return { matrix: addWithEqualDimension(restructuredMatrices), list: destinationList }
}

// Multiply two matrices with equal variable lists.
export function multiplyTwoWithEqualDimension(matrix1: PolynomialMatrix, matrix2: PolynomialMatrix): PolynomialMatrix {
	// Check the input.
	const dimensions1 = getDimensions(matrix1)
	const dimensions2 = getDimensions(matrix2)
	if (dimensions1.length !== dimensions2.length) throw new Error(`Invalid multiplication matrices: they are not of equal dimension, even though they are required to be. They are of dimensions ${dimensions1.length} and ${dimensions2.length}.`)

	// Walk through the matrices to set up a new one.
	const numVariables = dimensions1.length
	const newDimensions = repeat(numVariables, index => dimensions1[index] + dimensions2[index] - 1)
	return repeatMultidimensional(newDimensions, (...newIndices) => {
		const crossTermMinMax = repeat(numVariables, index => ({
			min: Math.max(0, newIndices[index] - dimensions2[index] + 1),
			max: Math.min(newIndices[index], dimensions1[index] - 1),
		}))
		const min = crossTermMinMax.map(minMax => minMax.min)
		const max = crossTermMinMax.map(minMax => minMax.max)

		let total = 0
		repeatMultidimensionalFromTo(min, max, (...crossTermIndices) => {
			const indices1 = crossTermIndices
			const indices2 = repeat(numVariables, index => newIndices[index] - crossTermIndices[index])
			total += getMatrixElement(matrix1, indices1) * getMatrixElement(matrix2, indices2)
		})
		return total
	})
}

// Multiply multiple matrices with equal variable lists.
export function multiplyWithEqualDimension(matrices: PolynomialMatrix[]): PolynomialMatrix {
	const matrixDimensions = matrices.map(matrix => getDimensions(matrix))
	if (matrixDimensions.some(dimensions => dimensions.length !== matrixDimensions[0].length)) throw new Error(`Invalid polynomial matrix sizes: tried to multiply polynomial matrices that had different dimensions. Dimensions were [${matrixDimensions.map(dimensions => dimensions.length).join(',')}].`)
	return matrices.slice(1).reduce((result, matrix) => multiplyTwoWithEqualDimension(result, matrix), matrices[0])
}

// Multiply matrices with variable lists. Returns { matrix, list }.
export function multiply(expressions: PolynomialExpression[], destinationList?: VariableList): PolynomialExpression {
	destinationList ??= [...union(...expressions.map(expression => new Set(expression.list)))]
	const restructuredMatrices = expressions.map(expression => restructure(expression.matrix, expression.list, destinationList))
	return { matrix: multiplyWithEqualDimension(restructuredMatrices), list: destinationList }
}

// Raise a polynomial matrix to a given power.
export function toPower(matrix: PolynomialMatrix, exponent: number): PolynomialMatrix {
	const ensuredExponent = ensureInt(exponent, true)
	const dimensions = getDimensions(matrix)
	if (ensuredExponent === 0) return repeatMultidimensional(dimensions.map(() => 1), () => 1)
	if (ensuredExponent === 1) return matrix
	return multiplyWithEqualDimension(new Array(ensuredExponent).fill(matrix))
}

// Return all powers of a matrix up to the given maximum exponent.
export function getPowerList(matrix: PolynomialMatrix, maxExponent: number): PolynomialMatrix[] {
	const ensuredMaxExponent = ensureInt(maxExponent, true)
	let matrixPower = matrix
	return repeat(ensuredMaxExponent + 1, exponent => {
		if (exponent === 0) return toPower(matrix, 0)
		if (exponent === 1) return matrix
		matrixPower = multiplyTwoWithEqualDimension(matrix, matrixPower)
		return matrixPower
	})
}
