import { product, getDimensions, getMatrixElement, repeatMultidimensional } from '@step-wise/utils'

import { PolynomialMatrix, VariableList, SubstitutionValues, PolynomialExpression } from './types'

// Restructure a polynomial matrix from an origin variable list to a destination variable list.
export function restructurePolynomial(expression: PolynomialExpression, destinationList: VariableList): PolynomialExpression {
	// Check the input.
	const oldDimensions = getDimensions(expression.matrix)
	expression.list.forEach((originVariable, originIndex) => {
		if (destinationList.indexOf(originVariable) === -1 && oldDimensions[originIndex] !== 1) throw new Error(`Cannot restructure matrix: the variable "${originVariable}" is not in the destination list, and the variable does exist in the polynomial.`)
	})

	// Set up mapping lists.
	const mappingNewToOld = destinationList.map(destinationVariable => expression.list.indexOf(destinationVariable))
	const mappingOldToNew = expression.list.map(originVariable => destinationList.indexOf(originVariable))
	const newDimensions = mappingNewToOld.map(index => (index === -1 ? 1 : oldDimensions[index]))

	// Apply the transformation.
	const matrix = repeatMultidimensional(newDimensions, (...newIndices) => {
		const oldIndices = mappingOldToNew.map(mappingIndex => (mappingIndex === -1 ? 0 : newIndices[mappingIndex]))
		return getMatrixElement(expression.matrix, oldIndices)
	}) as PolynomialMatrix
	return { matrix, list: destinationList }
}

// Substitute known variable values into a polynomial matrix, returning the reduced polynomial and remaining variables. Returns a number when all variables are substituted. Otherwise gives a PolynomialExpression.
export function substituteIntoPolynomial(expression: PolynomialExpression, values: SubstitutionValues): PolynomialExpression | number {
	// Define helpful lists.
	const isVariableKnown = expression.list.map(variable => values[variable] !== undefined)
	const unknownVariables = expression.list.filter(variable => values[variable] === undefined)
	const knownVariables = expression.list.filter(variable => values[variable] !== undefined)
	const knownVariableValues = knownVariables.map(variable => values[variable])

	// On no substitution, return the old data.
	if (knownVariables.length === 0) return expression

	// Define some mapping lists.
	const knownVariableIndices = expression.list.map((variable, index) => (values[variable] !== undefined ? index : undefined)).filter((index) => index !== undefined)
	const unknownVariableIndices = expression.list.map((variable, index) => (values[variable] !== undefined ? undefined : index)).filter((index) => index !== undefined)
	const inverseMapping = isVariableKnown.map((isKnown, index) => (isKnown ? knownVariableIndices.indexOf(index) : unknownVariableIndices.indexOf(index)))

	// Determine the dimensions of the old matrix, the new one, and what was removed.
	const dimensions = getDimensions(expression.matrix)
	const newDimensions = unknownVariableIndices.map(index => dimensions[index])
	const removedDimensions = knownVariableIndices.map(index => dimensions[index])

	// Set up the resulting matrix.
	const result = repeatMultidimensional(newDimensions, (...newIndices) => {
		let total = 0
		repeatMultidimensional(removedDimensions, (...removalIndices) => {
			const oldIndices = inverseMapping.map((mappingIndex, index) => (isVariableKnown[index] ? removalIndices : newIndices)[mappingIndex])
			const coefficient = getMatrixElement(expression.matrix, oldIndices)
			const factors = removalIndices.map((exponent, index) => knownVariableValues[index] ** exponent)
			total += coefficient * product(factors)
		})
		return total
	})

	// Check if there are any variables left.
	if (unknownVariables.length === 0) return result as number
	return { matrix: result as PolynomialMatrix, list: unknownVariables }
}
