const { ensureInt, sum, getDimensions, getMatrixElement, repeat, repeatMultidimensional, repeatMultidimensionalWithMinMax, union } = require('../../util')

const { restructure } = require('./restructureAndSubstitute')

// applyMinus will take the polynomial and apply a minus sign to all elements.
function applyMinus(matrix) {
	if (!Array.isArray(matrix))
		return -matrix
	return matrix.map(submatrix => applyMinus(submatrix))
}
module.exports.applyMinus = applyMinus

// addConstant will add a constant to the given polynomial.
function addConstant(matrix, addition) {
	if (!Array.isArray(matrix))
		return matrix + addition
	return [addConstant(matrix[0], addition), ...matrix.slice(1)]
}
module.exports.addConstant = addConstant

// multiplyByConstant will multiply the whole polynomial (all matrix elements) by the given constant.
function multiplyByConstant(matrix, multiplication) {
	if (!Array.isArray(matrix))
		return matrix * multiplication
	return matrix.map(submatrix => multiplyByConstant(submatrix, multiplication))
}
module.exports.multiplyByConstant = multiplyByConstant

// oneMinus will take the polynomial and return one minus the said polynomial.
function oneMinus(matrix) {
	return addConstant(applyMinus(matrix), 1)
}
module.exports.oneMinus = oneMinus

// addWithEqualDimension will take a list of matrices and add them all together. It once more assumes they are of equal dimension, and variable lists are matching.
function addWithEqualDimension(matrices) {
	// Check input dimensions.
	const matrixDimensions = matrices.map(matrix => getDimensions(matrix))
	if (matrixDimensions.some(dimensions => dimensions.length !== matrixDimensions[0].length))
		throw new Error(`Invalid polynomial matrix sizes: tried to add polynomial matrices that had different dimensions. Dimensions were [${matrixDimensions.map(dimensions => dimensions.length).join(',')}].`)

	// Add the matrices element-wise, using the biggest size on each dimension.
	const dimensions = repeat(matrixDimensions[0].length, index => Math.max(...matrixDimensions.map(dimensions => dimensions[index])))
	return repeatMultidimensional(dimensions, (...indices) => sum(matrices.map(matrix => getMatrixElement(matrix, indices) || 0)))
}
module.exports.addWithEqualDimension = addWithEqualDimension

// add will take matrices with variable lists and adds them. The variable lists may be different. It returns an object of the form { matrix, list } with the resulting matrix and variable list.
function add(matrices, lists, destinationList) {
	// Check input.
	if (matrices.length !== lists.length)
		throw new Error(`Invalid input: expected the same number of variable lists as matrices. This is not the case: ${matrices.length} matrices are given and ${lists.length} variable lists.`)

	// If there is no destination list, determine one.
	if (!destinationList)
		destinationList = [...union(...lists.map(list => new Set(list)))]

	// Restructure all matrices to the desired form. Then add them.
	matrices = matrices.map((matrix, index) => restructure(matrix, lists[index], destinationList))
	const matrix = addWithEqualDimension(matrices)
	return { matrix, list: destinationList }
}
module.exports.add = add

// multiplyTwoWithEqualDimension will take two matrices, with equal variable lists, and multiplies them.
function multiplyTwoWithEqualDimension(matrix1, matrix2) {
	// Check input dimensions.
	const dimensions1 = getDimensions(matrix1)
	const dimensions2 = getDimensions(matrix2)
	if (dimensions1.length !== dimensions2.length)
		throw new Error(`Invalid multiplication matrices: they are not of equal dimension, even though they are required to be. They are of dimensions ${dimensions1.length} and ${dimensions2.length}.`)
	const numVariables = dimensions1.length

	// Assemble the matrix. Do so by setting up an array of cross terms for each field, and summing up over them.
	const newDimensions = repeat(numVariables, index => dimensions1[index] + dimensions2[index] - 1)
	return repeatMultidimensional(newDimensions, (...newIndices) => {
		// Determine the minimum and maximum values of the cross-term indices. These are for matrix1. For matrix2 it will be the new index minus these cross-indices.
		const crossTermMinMax = repeat(numVariables, index => {
			const currIndex = newIndices[index]
			return {
				min: Math.max(0, currIndex - dimensions2[index] + 1),
				max: Math.min(currIndex, dimensions1[index] - 1),
			}
		})
		const min = crossTermMinMax.map(minMax => minMax.min)
		const max = crossTermMinMax.map(minMax => minMax.max)

		// Set up the cross-term matrix.
		const crossTerms = repeatMultidimensionalWithMinMax(min, max, (...crossTermIndices) => {
			const indices1 = crossTermIndices
			const indices2 = repeat(numVariables, index => newIndices[index] - crossTermIndices[index])
			return getMatrixElement(matrix1, indices1) * getMatrixElement(matrix2, indices2)
		})

		// Sum up all the terms of the cross-term matrix. (It may already be just a number.)
		return Array.isArray(crossTerms) ? sum(crossTerms.flat(numVariables - 1)) : crossTerms
	})
}
module.exports.multiplyTwoWithEqualDimension = multiplyTwoWithEqualDimension

// multiplyWithEqualDimension takes multiple matrices, all with (assumed) equal variable lists, and multiplies them all together. Since they are polynomials, the order does not matter.
function multiplyWithEqualDimension(matrices) {
	// Check input dimensions.
	const matrixDimensions = matrices.map(matrix => getDimensions(matrix))
	if (matrixDimensions.some(dimensions => dimensions.length !== matrixDimensions[0].length))
		throw new Error(`Invalid polynomial matrix sizes: tried to add polynomial matrices that had different dimensions. Dimensions were [${matrixDimensions.map(dimensions => dimensions.length).join(',')}].`)

	// Multiply iteratively.
	return matrices.reduce((result, matrix, index) => (index === 0 ? matrix : multiplyTwoWithEqualDimension(result, matrix)))
}
module.exports.multiplyWithEqualDimension = multiplyWithEqualDimension

// multiply will take a number of matrices, each with their own variable lists, and multiply them. The result is returned as an object { matrix, list }. If a destination list is given at the end, it is also restructured to match that list.
function multiply(matrices, lists, destinationList) {
	// Check input.
	if (matrices.length !== lists.length)
		throw new Error(`Invalid input: expected the same number of variable lists as matrices. This is not the case: ${matrices.length} matrices are given and ${lists.length} variable lists.`)

	// If there is no destination list, determine one.
	if (!destinationList)
		destinationList = [...union(...lists.map(list => new Set(list)))]

	// Restructure all matrices to the desired form. Then multiply them.
	matrices = matrices.map((matrix, index) => restructure(matrix, lists[index], destinationList))
	const matrix = multiplyWithEqualDimension(matrices)
	return { matrix, list: destinationList }
}
module.exports.multiply = multiply

// toPower takes a polynomial matrix and applies the given power. For instance, if we have "2 + 3a", represented by [2,3], then toPower([2,3], 3) will result in [8, 54, 36, 27] representing "(2+3a)^3 = 8 + 54a + 36a^2 + 27a^3".
function toPower(matrix, exponent) {
	exponent = ensureInt(exponent, true, false)
	const dimensions = getDimensions(matrix)

	// Check special cases.
	if (exponent === 0)
		return repeatMultidimensional(dimensions.map(_ => 1), _ => 1) // This becomes [[[1]]], where the number of brackets corresponds to the number of variables.
	if (exponent === 1)
		return matrix

	// Multiply all the matrices together.
	return multiplyWithEqualDimension(new Array(exponent).fill(matrix))
}
module.exports.toPower = toPower

// getPowerList takes a matrix and returns all the powers of the given matrix, up to the given limit (inclusive). So getPowerList(matrix, 4) returns [matrix^0, matrix^1, matrix^2, matrix^3, matrix^4]. It does this as efficiently as possible, reusing matrix multiplications where possible.
function getPowerList(matrix, maxExponent) {
	maxExponent = ensureInt(maxExponent, true)
	let matrixPower = matrix
	return repeat(maxExponent + 1, exponent => {
		if (exponent === 0)
			return toPower(matrix, 0)
		if (exponent === 1)
			return matrix
		matrixPower = multiplyTwoWithEqualDimension(matrix, matrixPower)
		return matrixPower
	})
}
module.exports.getPowerList = getPowerList
