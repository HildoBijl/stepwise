const { ensureNumber } = require('../../util/numbers')
const { sum, product, getDimensions, getMatrixElement } = require('../../util/arrays')
const { arraysToObject } = require('../../util/objects')
const { repeat, repeatMultidimensional, repeatMultidimensionalWithMinMax } = require('../../util/functions')
const { union, intersection } = require('../../util/sets')

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

// restructure takes a matrix corresponding to a list of variables, and adjusts it to a destination list of variables. All the variables in the origin list must be in the destination list, but not necessarily vice versa. An exception occurs when a variable has no influence on the polynomial: its corresponding array is only of size one, and hence it only comes in as x^0.
function restructure(matrix, originList, destinationList) {
	// Check that all variables in the origin list are in the destination list.
	const dimensions = getDimensions(matrix)
	originList.forEach((originSkill, originIndex) => {
		const destinationIndex = destinationList.indexOf(originSkill) === -1
		if (destinationIndex === -1 && dimensions[originIndex] !== 1)
			throw new Error(`Cannot restructure matrix: the variable "${originSkill}" is not in the destination list, and the variable does exist in the polynomial.`)
	})

	// Extract all required data.
	const mappingNewToOld = destinationList.map(destinationVariable => originList.indexOf(destinationVariable))
	const mappingOldToNew = originList.map(originVariable => destinationList.indexOf(originVariable))
	const oldDimensions = getDimensions(matrix)
	const newDimensions = mappingNewToOld.map(index => index === -1 ? 1 : oldDimensions[index])

	// Run the process of setting up the new matrix.
	return repeatMultidimensional(newDimensions, (...newIndices) => {
		const oldIndices = mappingOldToNew.map(mapIndex => mapIndex === -1 ? 0 : newIndices[mapIndex])
		return getMatrixElement(matrix, oldIndices)
	})
}
module.exports.restructure = restructure

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

// multiplyTwo will take two matrices, each with their own variable lists. It multiplies them and returns an object of the form { matrix, list } with the resulting matrix and variable list.
function multiplyTwo(matrix1, list1, matrix2, list2) {
	// Check input sizes.
	const dimensions1 = getDimensions(matrix1)
	const dimensions2 = getDimensions(matrix2)
	if (list1.length !== dimensions1.length || list2.length !== dimensions2.length)
		throw new Error(`Invalid variable lists: the variable lists did not correspond to the sizes of the polynomial matrices.`)

	// Extract data from the input.
	const s1 = new Set(list1)
	const s2 = new Set(list2)
	const list = [...union(s1, s2)]
	const inter = [...intersection(s1, s2)]
	const mappingListToL1 = list.map(listVariable => list1.indexOf(listVariable))
	const mappingListToL2 = list.map(listVariable => list2.indexOf(listVariable))
	const mappingL1ToList = list1.map(l1Variable => list.indexOf(l1Variable))
	const mappingL2ToList = list2.map(l2Variable => list.indexOf(l2Variable))
	const mappingInterToList = inter.map(interVariable => list.indexOf(interVariable))

	// Calculate the dimensions of the resulting matrix.
	const newDimensions = list.map((_, index) => {
		if (mappingListToL1[index] === -1)
			return dimensions2[mappingListToL2[index]]
		if (mappingListToL2[index] === -1)
			return dimensions1[mappingListToL1[index]]
		return dimensions1[mappingListToL1[index]] + dimensions2[mappingListToL2[index]] - 1
	})

	// Assemble the matrix. Do so by setting up an array of cross terms for each field, and summing up over them.
	const matrix = repeatMultidimensional(newDimensions, (...newIndices) => {
		// Determine the minimum and maximum values of the cross-term indices. These are for matrix1. For matrix2 it will be the new index minus these cross-indices.
		const crossTermMinMax = mappingInterToList.map(mapIndex => {
			const dimension1 = dimensions1[mappingListToL1[mapIndex]]
			const dimension2 = dimensions2[mappingListToL2[mapIndex]]
			const currIndex = newIndices[mapIndex]
			return {
				min: Math.max(0, currIndex - dimension2 + 1),
				max: Math.min(currIndex, dimension1 - 1),
			}
		})
		const min = crossTermMinMax.map(minMax => minMax.min)
		const max = crossTermMinMax.map(minMax => minMax.max)

		// Set up the cross-term matrix.
		const crossTerms = repeatMultidimensionalWithMinMax(min, max, (...crossTermIndices) => {
			// Apply the cross term index shift.
			const currIndices1New = [...newIndices]
			const currIndices2New = [...newIndices]
			mappingInterToList.map((mapIndex, num) => {
				const crossTermIndex = crossTermIndices[num]
				currIndices1New[mapIndex] = crossTermIndex
				currIndices2New[mapIndex] = newIndices[mapIndex] - crossTermIndex
			})

			// Transform back to old indices and calculate the cross-term.
			const currIndices1Old = mappingL1ToList.map(mapIndex => currIndices1New[mapIndex])
			const currIndices2Old = mappingL2ToList.map(mapIndex => currIndices2New[mapIndex])
			return getMatrixElement(matrix1, currIndices1Old) * getMatrixElement(matrix2, currIndices2Old)
		})

		// Sum up all the terms of the cross-term matrix.
		if (!Array.isArray(crossTerms))
			return crossTerms // No cross-terms: just a single number.
		return sum(crossTerms.flat(inter.length - 1))
	})

	return { matrix, list }
}
module.exports.multiplyTwo = multiplyTwo

// multiply will take a number of matrices, each with their own variable lists, and multiply them. The result is returned as an object { matrix, list }. If a destination list is given at the end, it is also restructured to match that list.
function multiply(matrices, lists, destinationList) {
	// Check input.
	if (matrices.length !== lists.length)
		throw new Error(`Invalid input: expected the same number of variable lists as matrices. This is not the case: ${matrices.length} matrices are given and ${lists.length} variable lists.`)

	// Multiply iteratively.
	let matrix = matrices[0], list = lists[0]
	repeat(matrices.length, (index) => {
		if (index === 0)
			return
		const result = multiplyTwo(matrix, list, matrices[index], lists[index])
		matrix = result.matrix
		list = result.list
	})

	// If a destination list is given, apply it.
	if (destinationList) {
		matrix = restructure(matrix, list, destinationList)
		list = destinationList
	}

	// All done!
	return { matrix, list }
}
module.exports.multiply = multiply

// substitute will take a polynomial matrix, a variable list and an object of values. For instance, if we have "1 + 2a + 3b + 4ab", represented by matrix [[1,3],[2,4]] and list ['a','b'], then substitute([[1,3],[2,4]], ['a','b'], {a:5}) will give { matrix: [11,23], list: ['b'] } to indicate "11 + 23b". Always an object { matrix, list } is returned to indicate the resulting polynomial and remaining variables.
function substitute(matrix, list, values) {
	// Gather relevant data from the input.
	const dimensions = getDimensions(matrix)
	const isVariableKnown = list.map(variable => values[variable] !== undefined)
	const unknownVariables = list.filter(variable => values[variable] === undefined)
	const knownVariables = list.filter(variable => values[variable] !== undefined)
	const knownVariableValues = knownVariables.map(variable => ensureNumber(values[variable]))

	// Set up mappings between the various indices.
	const knownVariablesIndices = list.map((variable, index) => values[variable] !== undefined ? index : undefined).filter(index => index !== undefined) // An array of indices of known variables.
	const unknownVariablesIndices = list.map((variable, index) => values[variable] !== undefined ? undefined : index).filter(index => index !== undefined) // An array of indices of unknown variables.
	const inverseMapping = isVariableKnown.map((isKnown, index) => isKnown ? knownVariablesIndices.indexOf(index) : unknownVariablesIndices.indexOf(index))

	// Walk through the unknown variables, setting up the matrix for them.
	const newDimensions = unknownVariablesIndices.map(index => dimensions[index])
	const removedDimensions = knownVariablesIndices.map(index => dimensions[index])
	const result = repeatMultidimensional(newDimensions, (...newIndices) => {
		// For each matrix element, walk through the known variables and evaluate the respective terms.
		const addedTerms = repeatMultidimensional(removedDimensions, (...removalIndices) => {
			const oldIndices = inverseMapping.map((mapIndex, index) => (isVariableKnown[index] ? removalIndices : newIndices)[mapIndex]) // Merge the two indices arrays together.
			const coefficient = getMatrixElement(matrix, oldIndices)
			const factors = removalIndices.map((exponent, index) => Math.pow(knownVariableValues[index], exponent))
			return coefficient * product(factors)
		})
		return sum(addedTerms.flat(removedDimensions.length - 1))
	})

	// All done!
	return { matrix: result, list: unknownVariables }
}
module.exports.substitute = substitute

// substituteAll will take a polynomial matrix and substitute the given values. For instance, if we have "1 + 2a + 3b + 4ab", represented by matrix [[1,3],[2,4]], then substitute([[1,3],[2,4]], [3,2]) will give 37. A value is returned.
function substituteAll(matrix, values) {
	// Check input.
	const dimensions = getDimensions(matrix)
	if (dimensions.length !== values.length)
		throw new Error(`Invalid values array: expected a values array with the same length as the number of variables. Instead, there were ${dimensions.length} variables and the values array has ${values.length} elements.`)

	// Evaluate all polynomial terms and add them together.
	const termsEvaluated = repeatMultidimensional(dimensions, (...indices) => {
		const coefficient = getMatrixElement(matrix, indices)
		const factors = indices.map((exponent, index) => Math.pow(values[index], exponent))
		return coefficient * product(factors)
	})
	return sum(termsEvaluated.flat(dimensions.length - 1))
}
module.exports.substituteAll = substituteAll