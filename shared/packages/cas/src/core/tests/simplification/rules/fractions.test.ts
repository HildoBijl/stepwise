import { negative, variable, sum, product, fraction, power } from '../../../construction'

import { normalizationRequirements } from '../../../operations'

import { expectSimplifyToGive } from '../../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('fraction simplification', () => {
	test('removes zero numerator from fractions', () => {
		expectSimplifyToGive(fraction(0, x), 0, ['reduceFractionsWithZeroNumerator'])
		expectSimplifyToGive(fraction(0, sum(x, y)), 0, ['reduceFractionsWithZeroNumerator'])
	})

	test('removes one denominator from fractions', () => {
		expectSimplifyToGive(fraction(x, 1), x, ['reduceFractionsWithOneDenominator'])
		expectSimplifyToGive(fraction(sum(x, y), 1), sum(x, y), ['reduceFractionsWithOneDenominator'])
	})

	test('merges fraction products', () => {
		expectSimplifyToGive(product(x, fraction(y, z)), fraction(product(x, y), z), ['mergeFractionProducts'])
		expectSimplifyToGive(product(fraction(x, y), fraction(z, 2)), fraction(product(x, z), product(y, 2)), ['mergeFractionProducts'])
		expectSimplifyToGive(product(2, fraction(x, 3), y), fraction(product(2, x, y), 3), ['mergeFractionProducts'])
	})

	test('flattens fractions', () => {
		expectSimplifyToGive(fraction(fraction(x, y), z), fraction(x, product(y, z)), ['flattenFractions'])
		expectSimplifyToGive(fraction(x, fraction(y, z)), fraction(product(x, z), y), ['flattenFractions'])
		expectSimplifyToGive(fraction(fraction(x, y), fraction(z, 2)), fraction(product(x, 2), product(y, z)), ['flattenFractions'])
	})

	test('merges fraction sums', () => {
		expectSimplifyToGive(sum(fraction(x, z), fraction(y, z)), fraction(sum(x, y), z), ['mergeFractionSums', 'mergeFractionProducts'])
		expectSimplifyToGive(sum(fraction(x, y), fraction(y, z)), fraction(sum(product(x, z), product(y, y)), product(y, z)), ['mergeFractionSums', 'mergeFractionProducts'])
		expectSimplifyToGive(sum(x, fraction(y, z)), fraction(sum(product(x, z), y), z), ['mergeFractionSums', 'mergeFractionProducts'])
		expectSimplifyToGive(sum(fraction(2, product(x, y)), fraction(3, product(y, z))), fraction(sum(product(2, product(y, z)), product(product(x, y), 3)), product(product(x, y), product(y, z))), ['mergeFractionSums', 'mergeFractionProducts'])
	})

	test('splits fractions', () => {
		expectSimplifyToGive(fraction(sum(x, y), z), sum(fraction(x, z), fraction(y, z)), ['splitFractions'])
		expectSimplifyToGive(fraction(sum(x, y, 2), z), sum(fraction(x, z), fraction(y, z), fraction(2, z)), ['splitFractions'])
		expectSimplifyToGive(fraction(sum(x, 2), x), sum(fraction(x, x), fraction(2, x)), ['splitFractions'])
	})

	test('cancels fraction minuses', () => {
		expectSimplifyToGive(fraction(negative(x), negative(y)), fraction(x, y), ['mergeFractionMinuses', 'removeDoubleNegatives'])
		expectSimplifyToGive(fraction(negative(x), y), negative(fraction(x, y)), ['mergeFractionMinuses', 'removeDoubleNegatives'])
		expectSimplifyToGive(fraction(x, negative(y)), negative(fraction(x, y)), ['mergeFractionMinuses', 'removeDoubleNegatives'])
	})

	test('cancels fraction numbers', () => {
		expectSimplifyToGive(fraction(6, 9), fraction(2, 3), ['mergeFractionNumbers'])
		expectSimplifyToGive(fraction(product(6, x), product(9, y)), fraction(product(2, x), product(3, y)), ['mergeFractionNumbers'])
		expectSimplifyToGive(fraction(sum(product(6, x), product(9, y)), 3), fraction(sum(product(2, x), product(3, y)), 1), ['mergeFractionNumbers'])
	})

	test('cancels fraction factors', () => {
		expectSimplifyToGive(fraction(x, x), fraction(1, 1), ['cancelFractionFactors', 'mergeProductMinuses', 'removeDoubleNegatives'])
		expectSimplifyToGive(fraction(product(x, y), product(x, z)), fraction(y, z), ['cancelFractionFactors', 'mergeProductMinuses', 'removeDoubleNegatives'])
		expectSimplifyToGive(fraction(product(x, y, z), product(x, y)), fraction(z, 1), ['cancelFractionFactors', 'mergeProductMinuses', 'removeDoubleNegatives'])
		expectSimplifyToGive(fraction(product(power(x, 3), power(y, 3)), product(power(x, 2), power(y, 3))), fraction(power(x, 3), power(x, 2)), ['cancelFractionFactors', 'mergeProductMinuses', 'removeDoubleNegatives'])
	})

	test('merges fraction factors', () => {
		expectSimplifyToGive(fraction(power(x, 5), power(x, 2)), fraction(power(x, sum(5, -2)), 1), ['mergeProductFactors', 'mergeFractionFactors'])
		expectSimplifyToGive(fraction(product(power(x, 2), y), product(power(x, 5), z)), fraction(product(power(x, sum(2, -5)), y), z), ['mergeProductFactors', 'mergeFractionFactors'])
		expectSimplifyToGive(fraction(product(x, power(y, 4)), product(power(x, 3), y)), fraction(product(power(x, sum(1, -3)), power(y, sum(4, -1))), 1), ['mergeProductFactors', 'mergeFractionFactors'])
	})

	test('normalizes fraction minuses', () => {
		expectSimplifyToGive(fraction(sum(negative(x), -3), 5), negative(fraction(sum(x, 3), 5)), ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives', 'normalizeFractionMinuses'])
		expectSimplifyToGive(fraction(x, sum(negative(y), 5)), negative(fraction(x, sum(y, negative(5)))), ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives', 'normalizeFractionMinuses'])
		expectSimplifyToGive(fraction(sum(negative(x), 3), sum(5, negative(y))), fraction(sum(x, -3), sum(y, -5)), ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives', 'normalizeFractionMinuses'])
		expectSimplifyToGive(fraction(sum(-3, x), negative(y)), negative(fraction(sum(x, -3), y)), ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives', 'normalizeFractionMinuses'])
	})

	test('applies polynomial cancellation', () => {
		expectSimplifyToGive(fraction(product(sum(x, 1), sum(x, 2)), product(sum(x, 1), sum(x, -3))), fraction(sum(x, 2), sum(x, -3)), [...normalizationRequirements, 'applyPolynomialCancellation'])
		expectSimplifyToGive(fraction(sum(power(x, 2), product(3, x), 2), sum(power(x, 2), -1)), fraction(sum(x, 2), sum(x, -1)), [...normalizationRequirements, 'applyPolynomialCancellation'])
		expectSimplifyToGive(fraction(sum(power(x, 2), product(-1, x), -2), sum(power(x, 2), product(-3, x), 2)), fraction(sum(x, 1), sum(x, -1)), [...normalizationRequirements, 'applyPolynomialCancellation'])
	})
})
