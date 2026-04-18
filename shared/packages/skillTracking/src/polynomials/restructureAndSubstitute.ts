import { product, getDimensions, getMatrixElement, repeatMultidimensional } from '@step-wise/utils'

import { PolynomialMatrix, VariableList, SubstitutionValues, PolynomialExpression } from './types'

// Restructure a polynomial matrix from an origin variable list to a destination variable list.
export function restructure(matrix: PolynomialMatrix, originList: VariableList, destinationList: VariableList): PolynomialMatrix {
	// Check the input.
	const oldDimensions = getDimensions(matrix)
	originList.forEach((originVariable, originIndex) => {
		if (destinationList.indexOf(originVariable) === -1 && oldDimensions[originIndex] !== 1) throw new Error(`Cannot restructure matrix: the variable "${originVariable}" is not in the destination list, and the variable does exist in the polynomial.`)
	})

	// Set up mapping lists.
	const mappingNewToOld = destinationList.map(destinationVariable => originList.indexOf(destinationVariable))
	const mappingOldToNew = originList.map(originVariable => destinationList.indexOf(originVariable))
	const newDimensions = mappingNewToOld.map(index => (index === -1 ? 1 : oldDimensions[index]))

	// Apply the transformation.
	return repeatMultidimensional(newDimensions, (...newIndices) => {
		const oldIndices = mappingOldToNew.map(mappingIndex => (mappingIndex === -1 ? 0 : newIndices[mappingIndex]))
		return getMatrixElement(matrix, oldIndices)
	}) as PolynomialMatrix
}

// Substitute known variable values into a polynomial matrix, returning the reduced polynomial and remaining variables.
export function substitute(matrix: PolynomialMatrix, variableList: VariableList, values: SubstitutionValues): PolynomialExpression {
	// Define helpful lists.
	const isVariableKnown = variableList.map(variable => values[variable] !== undefined)
	const unknownVariables = variableList.filter(variable => values[variable] === undefined)
	const knownVariables = variableList.filter(variable => values[variable] !== undefined)
	const knownVariableValues = knownVariables.map(variable => values[variable])

	// On no substitution, return the old data.
	if (knownVariables.length === 0) return { matrix, list: variableList }

	// Define some mapping lists.
	const knownVariableIndices = variableList.map((variable, index) => (values[variable] !== undefined ? index : undefined)).filter((index) => index !== undefined)
	const unknownVariableIndices = variableList.map((variable, index) => (values[variable] !== undefined ? undefined : index)).filter((index) => index !== undefined)
	const inverseMapping = isVariableKnown.map((isKnown, index) => (isKnown ? knownVariableIndices.indexOf(index) : unknownVariableIndices.indexOf(index)))

	// Determine the dimensions of the old matrix, the new one, and what was removed.
	const dimensions = getDimensions(matrix)
	const newDimensions = unknownVariableIndices.map(index => dimensions[index])
	const removedDimensions = knownVariableIndices.map(index => dimensions[index])

	// Set up the resulting matrix.
	const result = repeatMultidimensional(newDimensions, (...newIndices) => {
		let total = 0
		repeatMultidimensional(removedDimensions, (...removalIndices) => {
			const oldIndices = inverseMapping.map((mappingIndex, index) => (isVariableKnown[index] ? removalIndices : newIndices)[mappingIndex])
			const coefficient = getMatrixElement(matrix, oldIndices)
			const factors = removalIndices.map((exponent, index) => knownVariableValues[index] ** exponent)
			total += coefficient * product(factors)
		})
		return total
	}) as PolynomialMatrix
	return { matrix: result, list: unknownVariables }
}

// Substitute values for all variables in a polynomial matrix and evaluate the result.
export function substituteAll(matrix: PolynomialMatrix, values: number[]): number {
	// Check the input.
	const dimensions = getDimensions(matrix)
	if (dimensions.length !== values.length) throw new Error(`Invalid values array: expected a values array with the same length as the number of variables. Instead, there were ${dimensions.length} variables and the values array has ${values.length} elements.`)

	// Walk through the terms to add them all up.
	let total = 0
	repeatMultidimensional(dimensions, (...indices) => {
		const coefficient = getMatrixElement(matrix, indices)
		const factors = indices.map((exponent, index) => values[index] ** exponent)
		total += coefficient * product(factors)
	})
	return total
}
