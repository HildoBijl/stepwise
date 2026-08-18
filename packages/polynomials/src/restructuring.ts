import { ensureNumber, getDimensions, getMatrixElement, isNumber, product, repeat, repeatMultidimensional } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialValues, type PolynomialVariables } from './types'
import { ensurePolynomial, ensurePolynomialVariables } from './checks'

export function alignPolynomialVariables(polynomial: Polynomial, variables: PolynomialVariables): Polynomial {
	ensurePolynomial(polynomial)
	ensurePolynomialVariables(variables)
	const oldDimensions = getDimensions(polynomial.coefficients, isNumber)
	polynomial.variables.forEach((originVariable, originIndex) => {
		if (!variables.includes(originVariable) && oldDimensions[originIndex] !== 1) throw new Error(`Cannot align polynomial variables: the active variable "${originVariable}" is absent from the destination variables.`)
	})
	const mappingNewToOld = variables.map(variable => polynomial.variables.indexOf(variable))
	const mappingOldToNew = polynomial.variables.map(variable => variables.indexOf(variable))
	const newDimensions = mappingNewToOld.map(index => index === -1 ? 1 : oldDimensions[index])
	const coefficients = repeatMultidimensional(newDimensions, (...newIndices) => {
		const oldIndices = mappingOldToNew.map(index => index === -1 ? 0 : newIndices[index])
		return getMatrixElement(polynomial.coefficients, oldIndices, isNumber)
	})
	return { coefficients, variables }
}

export function substitutePolynomial(polynomial: Polynomial, values: PolynomialValues): Polynomial {
	ensurePolynomial(polynomial)
	const variables = polynomial.variables.filter(variable => Object.hasOwn(values, variable))
	const ensuredValues = Object.fromEntries(variables.map(variable => [variable, ensureNumber(values[variable])]))
	return substitutePolynomialIndividualMoments(polynomial, (variable, exponent) => ensuredValues[variable] ** exponent, variables)
}

export function evaluatePolynomial(polynomial: Polynomial, values: PolynomialValues): number {
	ensurePolynomial(polynomial)
	const missingVariable = polynomial.variables.find(variable => !Object.hasOwn(values, variable))
	if (missingVariable !== undefined) throw new Error(`Cannot evaluate polynomial: no value was provided for variable "${missingVariable}".`)
	const result = substitutePolynomial(polynomial, values)
	if (typeof result.coefficients !== 'number') throw new TypeError('Cannot evaluate polynomial: substitution did not produce a constant polynomial.')
	return result.coefficients
}

export function substitutePolynomialIndividualMoments(polynomial: Polynomial, getIndividualMoment: (variable: string, exponent: number) => number, variables: PolynomialVariables = polynomial.variables): Polynomial {
	ensurePolynomial(polynomial)
	ensurePolynomialVariables(variables)
	const knownVariables = variables.filter(variable => polynomial.variables.includes(variable))
	const dimensions = getDimensions(polynomial.coefficients, isNumber)
	const moments = knownVariables.map(variable => repeat(dimensions[polynomial.variables.indexOf(variable)], exponent => ensureNumber(getIndividualMoment(variable, exponent))))
	const getMoment = (exponents: readonly number[]) => product(exponents.map((exponent, index) => moments[index][exponent]))
	return substitutePolynomialMoments(polynomial, getMoment, knownVariables)
}

export function substitutePolynomialMoments(polynomial: Polynomial, getMoment: (exponents: readonly number[], variables: PolynomialVariables) => number, variables: PolynomialVariables = polynomial.variables): Polynomial {
	ensurePolynomial(polynomial)
	ensurePolynomialVariables(variables)
	const knownVariables = variables.filter(variable => polynomial.variables.includes(variable))
	const unknownVariables = polynomial.variables.filter(variable => !knownVariables.includes(variable))
	if (knownVariables.length === 0) return polynomial
	const dimensions = getDimensions(polynomial.coefficients, isNumber)
	const newDimensions = unknownVariables.map(variable => dimensions[polynomial.variables.indexOf(variable)])
	const removedDimensions = knownVariables.map(variable => dimensions[polynomial.variables.indexOf(variable)])
	const coefficients = repeatMultidimensional(newDimensions, (...newIndices) => {
		let total = 0
		repeatMultidimensional(removedDimensions, (...removedIndices) => {
			const oldIndices = polynomial.variables.map(variable => knownVariables.includes(variable) ? removedIndices[knownVariables.indexOf(variable)] : newIndices[unknownVariables.indexOf(variable)])
			total += getMatrixElement(polynomial.coefficients, oldIndices, isNumber) * ensureNumber(getMoment(removedIndices, knownVariables))
		})
		return total
	})
	return { coefficients, variables: unknownVariables }
}
