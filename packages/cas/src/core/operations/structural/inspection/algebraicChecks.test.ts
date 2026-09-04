import { describe, expect, test } from 'vitest'

import { fraction, integer, log, plusMinus, power, root, sin, sum, variable } from '../../../construction/index.ts'

import { containsFloat, containsLogarithm, containsMultiCharacterVariables, containsRoot, containsTrigonometricFunction, containsVariables, isNumeric, isPlural, isPolynomial, isRational, isSingular } from './algebraicChecks.ts'

describe('algebraic checks', () => {
	test('detects contained node families', () => {
		expect(containsVariables(sum(1, 'x'))).toBe(true)
		expect(containsMultiCharacterVariables(variable('speed'))).toBe(true)
		expect(containsFloat(sum(1, 1.5))).toBe(true)
		expect(containsRoot(root('x', 3))).toBe(true)
		expect(containsLogarithm(log('x', 2))).toBe(true)
		expect(containsTrigonometricFunction(sin('x'))).toBe(true)
	})

	test('distinguishes numeric, singular, and plural expressions', () => {
		expect(isNumeric(fraction(1, root(2, 3)))).toBe(true)
		expect(isNumeric(sum(1, 'x'))).toBe(false)
		expect(isPlural(plusMinus(2))).toBe(true)
		expect(isSingular(integer(2))).toBe(true)
	})

	test('classifies polynomial and rational expressions', () => {
		expect(isPolynomial(sum(power('x', 2), 1))).toBe(true)
		expect(isPolynomial(power('x', -1))).toBe(false)
		expect(isRational(fraction(sum('x', 1), sum('x', -1)))).toBe(true)
	})
})
