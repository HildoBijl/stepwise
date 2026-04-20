import { ensureInt, sum, getDimensions, getMatrixElement, repeat, repeatMultidimensional, repeatMultidimensionalFromTo, union } from '@step-wise/utils'

import { PolynomialMatrix, VariableList, PolynomialExpression } from './types'
import { restructurePolynomial } from './restructuring'

// Support function that takes an expression and applies a certain matrix operation to the matrix, while keeping the variable list intact.
function applyOperationToMatrix<TArgs extends unknown[]>(expression: PolynomialExpression, operation: (matrix: PolynomialMatrix, ...args: TArgs) => PolynomialMatrix, ...args: TArgs) {
	return { ...expression, matrix: operation(expression.matrix, ...args) }
}

// Apply a minus sign to all elements of a polynomial matrix.
export function applyMinusToPolynomial(expression: PolynomialExpression): PolynomialExpression {
	return multiplyPolynomialByConstant(expression, -1)
}

// Add a constant to a polynomial.
function addConstantToPolynomialMatrix(matrix: PolynomialMatrix, addition: number): PolynomialMatrix {
	return Array.isArray(matrix[0]) ? [addConstantToPolynomialMatrix(matrix[0], addition), ...matrix.slice(1)] : [matrix[0] as number + addition, ...matrix.slice(1)]
}
export function addConstantToPolynomial(expression: PolynomialExpression, addition: number): PolynomialExpression {
	return applyOperationToMatrix(expression, addConstantToPolynomialMatrix, addition)
}

// Multiply all matrix elements by a constant.
function multiplyPolynomialMatrixByConstant(matrix: PolynomialMatrix, multiplication: number): PolynomialMatrix {
	return matrix.map(submatrix => Array.isArray(submatrix) ? multiplyPolynomialMatrixByConstant(submatrix, multiplication) : submatrix as number * multiplication)
}
export function multiplyPolynomialByConstant(expression: PolynomialExpression, multiplication: number): PolynomialExpression {
	return applyOperationToMatrix(expression, multiplyPolynomialMatrixByConstant, multiplication)
}

// Return one minus the given polynomial.
export function oneMinusPolynomial(expression: PolynomialExpression): PolynomialExpression {
	return addConstantToPolynomial(applyMinusToPolynomial(expression), 1)
}

// Add matrices of equal variable dimension.
function addPolynomialMatricesWithEqualDimension(matrices: PolynomialMatrix[]): PolynomialMatrix {
	const matrixDimensions = matrices.map(matrix => getDimensions(matrix))
	if (matrixDimensions.some(dimensions => dimensions.length !== matrixDimensions[0].length)) throw new Error(`Invalid polynomial matrix sizes: tried to add polynomial matrices that had different dimensions. Dimensions were [${matrixDimensions.map(dimensions => dimensions.length).join(',')}].`)
	const dimensions = repeat(matrixDimensions[0].length, index => Math.max(...matrixDimensions.map(dimensions => dimensions[index])))
	return repeatMultidimensional(dimensions, (...indices) => sum(matrices.map(matrix => getMatrixElement(matrix, indices, true) ?? 0))) as PolynomialMatrix
}

// Add matrices with variable lists. Returns { matrix, list }.
export function addPolynomials(expressions: PolynomialExpression[], destinationList?: VariableList): PolynomialExpression {
	destinationList ??= [...union(...expressions.map(expression => new Set(expression.list)))]
	const restructuredMatrices = expressions.map(expression => restructurePolynomial(expression, destinationList).matrix)
	return { matrix: addPolynomialMatricesWithEqualDimension(restructuredMatrices), list: destinationList }
}

// Multiply two matrices with equal variable lists.
function multiplyTwoPolynomialMatricesWithEqualDimension(matrix1: PolynomialMatrix, matrix2: PolynomialMatrix): PolynomialMatrix {
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
	}) as PolynomialMatrix
}

// Multiply multiple matrices with equal variable lists.
function multiplyPolynomialMatricesWithEqualDimension(matrices: PolynomialMatrix[]): PolynomialMatrix {
	const matrixDimensions = matrices.map(matrix => getDimensions(matrix))
	if (matrixDimensions.some(dimensions => dimensions.length !== matrixDimensions[0].length)) throw new Error(`Invalid polynomial matrix sizes: tried to multiply polynomial matrices that had different dimensions. Dimensions were [${matrixDimensions.map(dimensions => dimensions.length).join(',')}].`)
	return matrices.slice(1).reduce((result, matrix) => multiplyTwoPolynomialMatricesWithEqualDimension(result, matrix), matrices[0])
}

// Multiply matrices with variable lists. Returns { matrix, list }.
export function multiplyPolynomials(expressions: PolynomialExpression[], destinationList?: VariableList): PolynomialExpression {
	destinationList ??= [...union(...expressions.map(expression => new Set(expression.list)))]
	const restructuredMatrices = expressions.map(expression => restructurePolynomial(expression, destinationList).matrix)
	return { matrix: multiplyPolynomialMatricesWithEqualDimension(restructuredMatrices), list: destinationList }
}

// Raise a polynomial matrix to a given power.
function polynomialMatrixToPower(matrix: PolynomialMatrix, exponent: number): PolynomialMatrix {
	const ensuredExponent = ensureInt(exponent, true)
	const dimensions = getDimensions(matrix)
	if (ensuredExponent === 0) return repeatMultidimensional(dimensions.map(() => 1), () => 1) as PolynomialMatrix
	if (ensuredExponent === 1) return matrix
	return multiplyPolynomialMatricesWithEqualDimension(new Array(ensuredExponent).fill(matrix))
}
export function polynomialToPower(expression: PolynomialExpression, exponent: number): PolynomialExpression {
	return applyOperationToMatrix(expression, polynomialMatrixToPower, exponent)
}

// Return all powers of a matrix up to (and including) the given maximum exponent. So it gives [1, f(x), f(x)^2, ..., f(x)^n].
function getPolynomialMatrixPowerList(matrix: PolynomialMatrix, maxExponent: number): PolynomialMatrix[] {
	const ensuredMaxExponent = ensureInt(maxExponent, true)
	let matrixPower = matrix
	return repeat(ensuredMaxExponent + 1, exponent => {
		if (exponent === 0) return polynomialMatrixToPower(matrix, 0)
		if (exponent === 1) return matrix
		matrixPower = multiplyTwoPolynomialMatricesWithEqualDimension(matrix, matrixPower)
		return matrixPower
	})
}
export function getPolynomialPowerList(expression: PolynomialExpression, maxExponent: number): PolynomialExpression {
	return applyOperationToMatrix(expression, getPolynomialMatrixPowerList, maxExponent)
}
