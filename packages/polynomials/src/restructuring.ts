import { isNumber, product, getDimensions, getMatrixElement, repeat, repeatMultidimensional } from '@step-wise/js-utils'

import { VariableList, SubstitutionValues, PolynomialExpression } from './types'
import { ensurePolynomialExpression } from './checks'

// Restructure a polynomial matrix from an origin variable list to a destination variable list.
export function restructurePolynomial(expression: PolynomialExpression, destinationList: VariableList): PolynomialExpression {
	ensurePolynomialExpression(expression)
	// Check the input.
	const oldDimensions = getDimensions(expression.matrix, isNumber)
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
		return getMatrixElement(expression.matrix, oldIndices, isNumber)
	})
	return { matrix, list: destinationList }
}

// Substitute known variable values, returning a polynomial over the remaining variables.
export function substituteIntoPolynomial(expression: PolynomialExpression, values: SubstitutionValues): PolynomialExpression {
	ensurePolynomialExpression(expression)
	const variablesToSubstitute = expression.list.filter(variable => Object.hasOwn(values, variable))
	const getIndividualMoment = (index: number, exponent: number) => values[variablesToSubstitute[index]] ** exponent
	return substituteIndividualMomentsIntoPolynomial(expression, getIndividualMoment, variablesToSubstitute)
}

// Substitute known variable moments, returning a polynomial over the remaining variables. The getIndividualMoment function must return, for the given variable x (index corresponding to variablesToSubstitute) the value of x^exponent.
export function substituteIndividualMomentsIntoPolynomial(expression: PolynomialExpression, getIndividualMoment: (index: number, exponent: number) => number, variablesToSubstitute: VariableList = expression.list): PolynomialExpression {
	ensurePolynomialExpression(expression)
	// Determine the individual moments for each of the given variables.
	const knownVariables = variablesToSubstitute.filter(variable => expression.list.includes(variable))
	const dimensions = getDimensions(expression.matrix, isNumber)
	const knownVariableDimensions = knownVariables.map(variable => dimensions[expression.list.indexOf(variable)])
	const moments = knownVariableDimensions.map((dimension, index) => repeat(dimension, exponent => getIndividualMoment(variablesToSubstitute.indexOf(knownVariables[index]), exponent)))

	// Set up a getMoment function for a set of exponents, and apply it to the next function.
	const getMoment = (exponents: number[]) => product(exponents.map((exponent, index) => moments[index][exponent]))
	return substituteMomentsIntoPolynomial(expression, getMoment, knownVariables)
}

// Substitute known joint moments, returning a polynomial over the remaining variables. The given getMoment function receives an array of powers like [2, 0, 3]. Indices correspond to the variablesToSubstitute. It must return the corresponding moment, like x^2*y^0*z^3.
export function substituteMomentsIntoPolynomial(expression: PolynomialExpression, getMoment: (exponents: number[]) => number, variablesToSubstitute: VariableList = expression.list): PolynomialExpression {
	ensurePolynomialExpression(expression)
	// Define helpful lists.
	const knownVariables = variablesToSubstitute.filter(variable => expression.list.includes(variable))
	const unknownVariables = expression.list.filter(variable => !knownVariables.includes(variable))

	// On no substitution, return the old data.
	if (knownVariables.length === 0) return expression

	// Determine the dimensions of the old matrix, the new one, and what was removed.
	const dimensions = getDimensions(expression.matrix, isNumber)
	const newDimensions = unknownVariables.map(variable => dimensions[expression.list.indexOf(variable)])
	const removedDimensions = knownVariables.map(variable => dimensions[expression.list.indexOf(variable)])

	// Set up the resulting matrix.
	const result = repeatMultidimensional(newDimensions, (...newIndices) => {
		let total = 0
		repeatMultidimensional(removedDimensions, (...removalIndices) => {
			const oldIndices = expression.list.map(variable => knownVariables.includes(variable) ? removalIndices[knownVariables.indexOf(variable)] : newIndices[unknownVariables.indexOf(variable)])
			const coefficient = getMatrixElement(expression.matrix, oldIndices, isNumber)
			total += coefficient * getMoment(removalIndices)
		})
		return total
	})

	return { matrix: result, list: unknownVariables }
}
