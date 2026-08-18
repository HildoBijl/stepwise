import { product, repeat, repeatMultidimensional } from '@step-wise/js-utils'

import { VariableList, SubstitutionValues, PolynomialExpression } from './types'
import { getPolynomialCoefficient, getPolynomialDimensions } from './coefficients'

// Restructure a polynomial matrix from an origin variable list to a destination variable list.
export function restructurePolynomial(expression: PolynomialExpression, destinationList: VariableList): PolynomialExpression {
	// Check the input.
	const oldDimensions = getPolynomialDimensions(expression.matrix)
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
		return getPolynomialCoefficient(expression.matrix, oldIndices)
	})
	return { matrix, list: destinationList }
}

// Substitute known variable values, returning a polynomial over the remaining variables.
export function substituteIntoPolynomial(expression: PolynomialExpression, values: SubstitutionValues): PolynomialExpression {
	const variablesToSubstitute = Object.keys(values)
	const valueList = variablesToSubstitute.map(variable => values[variable])
	const getIndividualMoment = (index: number, exponent: number) => valueList[index] ** exponent
	return substituteIndividualMomentsIntoPolynomial(expression, getIndividualMoment, variablesToSubstitute)
}

// Substitute known variable moments, returning a polynomial over the remaining variables. The getIndividualMoment function must return, for the given variable x (index corresponding to variablesToSubstitute) the value of x^exponent.
export function substituteIndividualMomentsIntoPolynomial(expression: PolynomialExpression, getIndividualMoment: (index: number, exponent: number) => number, variablesToSubstitute: VariableList = expression.list): PolynomialExpression {
	// Determine the individual moments for each of the given variables.
	const knownVariableIndices = expression.list.map((variable, index) => (variablesToSubstitute.includes(variable) ? index : undefined)).filter((index) => index !== undefined)
	const dimensions = getPolynomialDimensions(expression.matrix)
	const knownVariableDimensions = knownVariableIndices.map(index => dimensions[index])
	const moments = knownVariableDimensions.map((dimension, index) => repeat(dimension, exponent => getIndividualMoment(index, exponent)))

	// Set up a getMoment function for a set of exponents, and apply it to the next function.
	const getMoment = (exponents: number[]) => product(exponents.map((exponent, index) => moments[index][exponent]))
	return substituteMomentsIntoPolynomial(expression, getMoment, variablesToSubstitute)
}

// Substitute known joint moments, returning a polynomial over the remaining variables. The given getMoment function receives an array of powers like [2, 0, 3]. Indices correspond to the variablesToSubstitute. It must return the corresponding moment, like x^2*y^0*z^3.
export function substituteMomentsIntoPolynomial(expression: PolynomialExpression, getMoment: (exponents: number[]) => number, variablesToSubstitute: VariableList = expression.list): PolynomialExpression {
	// Define helpful lists.
	const isVariableKnown = expression.list.map(variable => variablesToSubstitute.includes(variable))
	const unknownVariables = expression.list.filter(variable => !variablesToSubstitute.includes(variable))
	const knownVariables = expression.list.filter(variable => variablesToSubstitute.includes(variable))

	// On no substitution, return the old data.
	if (knownVariables.length === 0) return expression

	// Define some mapping lists.
	const knownVariableIndices = expression.list.map((variable, index) => (variablesToSubstitute.includes(variable) ? index : undefined)).filter((index) => index !== undefined)
	const unknownVariableIndices = expression.list.map((variable, index) => (variablesToSubstitute.includes(variable) ? undefined : index)).filter((index) => index !== undefined)
	const inverseMapping = isVariableKnown.map((isKnown, index) => (isKnown ? knownVariableIndices.indexOf(index) : unknownVariableIndices.indexOf(index)))

	// Determine the dimensions of the old matrix, the new one, and what was removed.
	const dimensions = getPolynomialDimensions(expression.matrix)
	const newDimensions = unknownVariableIndices.map(index => dimensions[index])
	const removedDimensions = knownVariableIndices.map(index => dimensions[index])

	// Set up the resulting matrix.
	const result = repeatMultidimensional(newDimensions, (...newIndices) => {
		let total = 0
		repeatMultidimensional(removedDimensions, (...removalIndices) => {
			const oldIndices = inverseMapping.map((mappingIndex, index) => (isVariableKnown[index] ? removalIndices : newIndices)[mappingIndex])
			const coefficient = getPolynomialCoefficient(expression.matrix, oldIndices)
			total += coefficient * getMoment(removalIndices)
		})
		return total
	})

	return { matrix: result, list: unknownVariables }
}
