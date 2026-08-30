import { ensureNumber } from '@step-wise/js-utils'

import { type Polynomial, type PolynomialValues, type PolynomialVariable, type PolynomialVariables } from './types.ts'
import { ensurePolynomial, ensurePolynomialVariables } from './checks.ts'
import { createPolynomial } from './creation.ts'

export function alignPolynomialVariables(polynomial: Polynomial, variables: PolynomialVariables): Polynomial {
	ensurePolynomial(polynomial)
	ensurePolynomialVariables(variables)
	polynomial.variables.forEach((variable, variableIndex) => {
		if (!variables.includes(variable) && polynomial.terms.some(term => term.exponents[variableIndex] !== 0)) throw new Error(`Cannot align polynomial variables: the active variable "${variable}" is absent from the destination variables.`)
	})
	return createPolynomial(polynomial.terms.map(term => ({
		coefficient: term.coefficient,
		exponents: variables.map(variable => {
			const oldIndex = polynomial.variables.indexOf(variable)
			return oldIndex === -1 ? 0 : term.exponents[oldIndex]
		}),
	})), variables)
}

export function substitutePolynomial(polynomial: Polynomial, values: PolynomialValues): Polynomial {
	ensurePolynomial(polynomial)
	const variables = polynomial.variables.filter(variable => Object.hasOwn(values, variable))
	const ensuredValues = Object.fromEntries(variables.map(variable => [variable, ensureNumber(values[variable])]))
	return substitutePolynomialMoments(polynomial, (variable, exponent) => ensuredValues[variable] ** exponent, variables)
}

export function evaluatePolynomial(polynomial: Polynomial, values: PolynomialValues): number {
	ensurePolynomial(polynomial)
	const missingVariable = polynomial.variables.find(variable => !Object.hasOwn(values, variable))
	if (missingVariable !== undefined) throw new Error(`Cannot evaluate polynomial: no value was provided for variable "${missingVariable}".`)
	const result = substitutePolynomial(polynomial, values)
	return result.terms[0]?.coefficient ?? 0
}

export function substitutePolynomialMoments(polynomial: Polynomial, getMoment: (variable: PolynomialVariable, exponent: number) => number, variables: PolynomialVariables = polynomial.variables): Polynomial {
	ensurePolynomial(polynomial)
	ensurePolynomialVariables(variables)
	const knownVariables = variables.filter(variable => polynomial.variables.includes(variable))
	const moments = new Map<string, number>()
	const getEnsuredMoment = (variable: PolynomialVariable, exponent: number): number => {
		const key = `${variable}:${exponent}`
		const cachedMoment = moments.get(key)
		if (cachedMoment !== undefined) return cachedMoment
		const moment = ensureNumber(getMoment(variable, exponent))
		moments.set(key, moment)
		return moment
	}
	return substitutePolynomialJointMoments(polynomial, (momentVariables, exponents) => momentVariables.reduce((product, variable, index) => product * getEnsuredMoment(variable, exponents[index]), 1), knownVariables)
}

function substitutePolynomialJointMoments(polynomial: Polynomial, getMoment: (variables: PolynomialVariables, exponents: readonly number[]) => number, variables: PolynomialVariables): Polynomial {
	const knownVariables = variables.filter(variable => polynomial.variables.includes(variable))
	if (knownVariables.length === 0) return polynomial
	const unknownVariables = polynomial.variables.filter(variable => !knownVariables.includes(variable))
	return createPolynomial(polynomial.terms.map(term => {
		const knownExponents = knownVariables.map(variable => term.exponents[polynomial.variables.indexOf(variable)])
		const unknownExponents = unknownVariables.map(variable => term.exponents[polynomial.variables.indexOf(variable)])
		return { coefficient: term.coefficient * ensureNumber(getMoment(knownVariables, knownExponents)), exponents: unknownExponents }
	}), unknownVariables)
}
