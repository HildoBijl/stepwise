const { ensureNumber, sum, product, getDimensions, getMatrixElement, repeatMultidimensional } = require('../../util')

// restructure takes a matrix corresponding to a list of variables, and adjusts it to a destination list of variables. All the variables in the origin list must be in the destination list, but not necessarily vice versa. An exception occurs when a variable has no influence on the polynomial: its corresponding array is only of size one, and hence it only comes in as x^0.
function restructure(matrix, originList, destinationList) {
	// Check that all variables in the origin list are in the destination list.
	const dimensions = getDimensions(matrix)
	originList.forEach((originSkill, originIndex) => {
		const destinationIndex = destinationList.indexOf(originSkill)
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

// substitute will take a polynomial matrix, a variable list and an object of values. For instance, if we have "1 + 2a + 3b + 4ab", represented by matrix [[1,3],[2,4]] and list ['a','b'], then substitute([[1,3],[2,4]], ['a','b'], {a:5}) will give { matrix: [11,23], list: ['b'] } to indicate "11 + 23b". Always an object { matrix, list } is returned to indicate the resulting polynomial and remaining variables.
function substitute(matrix, list, values) {
	// Gather relevant data from the input.
	const dimensions = getDimensions(matrix)
	const isVariableKnown = list.map(variable => values[variable] !== undefined)
	const unknownVariables = list.filter(variable => values[variable] === undefined)
	const knownVariables = list.filter(variable => values[variable] !== undefined)
	const knownVariableValues = knownVariables.map(variable => ensureNumber(values[variable]))

	// If there are no known variables, do nothing.
	if (knownVariables.length === 0)
		return { matrix, list }

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
