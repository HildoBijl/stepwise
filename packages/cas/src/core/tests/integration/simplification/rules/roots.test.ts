import { describe, test } from 'vitest'

import { variable, sqrt, root, sum, product, fraction, power } from '../../../../construction/index.ts'

import { expectSimplifyToGive } from '../../../testUtils.ts'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('root simplification', () => {
	test('reduces roots with zero argument', () => {
		expectSimplifyToGive(sqrt(0), 0, ['simplifyZeroRadicandRoots'])
		expectSimplifyToGive(root(0, 3), 0, ['simplifyZeroRadicandRoots'])
	})

	test('reduces roots with one argument', () => {
		expectSimplifyToGive(sqrt(1), 1, ['simplifyUnitRadicandRoots'])
		expectSimplifyToGive(root(1, 3), 1, ['simplifyUnitRadicandRoots'])
	})

	test('reduces integer roots', () => {
		expectSimplifyToGive(sqrt(25), 5, ['evaluateNumericRoots'])
		expectSimplifyToGive(sqrt(24), sqrt(24), ['evaluateNumericRoots'])
		expectSimplifyToGive(root(27, 3), 3, ['evaluateNumericRoots'])
		expectSimplifyToGive(root(28, 3), root(28, 3), ['evaluateNumericRoots'])
	})

	test('reduces canceled roots', () => {
		expectSimplifyToGive(sqrt(power(x, 2)), x, ['cancelMatchingRootsAndPowers'])
		expectSimplifyToGive(root(power(x, 3), 3), x, ['cancelMatchingRootsAndPowers'])
		expectSimplifyToGive(root(power(sum(x, y), 4), 4), sum(x, y), ['cancelMatchingRootsAndPowers'])
		expectSimplifyToGive(power(root(sum(x, y), 4), 4), sum(x, y), ['cancelMatchingRootsAndPowers'])
	})

	test('turns roots into fraction exponents', () => {
		expectSimplifyToGive(sqrt(x), power(x, fraction(1, 2)), ['rewriteRootsAsFractionalPowers'])
		expectSimplifyToGive(root(x, 3), power(x, fraction(1, 3)), ['rewriteRootsAsFractionalPowers'])
		expectSimplifyToGive(root(sum(x, y), 4), power(sum(x, y), fraction(1, 4)), ['rewriteRootsAsFractionalPowers'])
	})

	test('turns fraction exponents into roots', () => {
		expectSimplifyToGive(power(x, fraction(1, 2)), root(x, 2), ['simplifyUnitExponentPowers', 'rewriteFractionalPowersAsRoots'])
		expectSimplifyToGive(power(x, fraction(1, 3)), root(x, 3), ['simplifyUnitExponentPowers', 'rewriteFractionalPowersAsRoots'])
		expectSimplifyToGive(power(x, fraction(2, 3)), root(power(x, 2), 3), ['simplifyUnitExponentPowers', 'rewriteFractionalPowersAsRoots'])
		expectSimplifyToGive(power(x, fraction(8, 3)), root(power(x, 8), 3), ['simplifyUnitExponentPowers', 'rewriteFractionalPowersAsRoots'])
	})

	test('turns base two roots into square roots', () => {
		expectSimplifyToGive(root(x, 2), sqrt(x), ['rewriteSquareRootsAsSqrts'])
		expectSimplifyToGive(root(sum(x, y), 2), sqrt(sum(x, y)), ['rewriteSquareRootsAsSqrts'])
		expectSimplifyToGive(root(x, 3), root(x, 3), ['rewriteSquareRootsAsSqrts'])
	})

	test('turns square roots into base two roots', () => {
		expectSimplifyToGive(sqrt(x), root(x, 2), ['rewriteSqrtsAsSquareRoots'])
		expectSimplifyToGive(sqrt(sum(x, y)), root(sum(x, y), 2), ['rewriteSqrtsAsSquareRoots'])
		expectSimplifyToGive(root(x, 2), root(x, 2), ['rewriteSqrtsAsSquareRoots'])
	})

	test('expands roots of products', () => {
		expectSimplifyToGive(sqrt(product(x, y)), product(sqrt(x), sqrt(y)), ['expandRootsOfProducts'])
		expectSimplifyToGive(sqrt(product(x, y, z)), product(sqrt(x), sqrt(y), sqrt(z)), ['expandRootsOfProducts'])
		expectSimplifyToGive(root(product(x, y), 3), product(root(x, 3), root(y, 3)), ['expandRootsOfProducts'])
	})

	test('merges products of roots', () => {
		expectSimplifyToGive(product(sqrt(x), sqrt(y)), sqrt(product(x, y)), ['combineRootsInProducts'])
		expectSimplifyToGive(product(sqrt(x), sqrt(y), sqrt(z)), sqrt(product(x, y, z)), ['combineRootsInProducts'])
		expectSimplifyToGive(product(root(x, 3), root(y, 3)), root(product(x, y), 3), ['combineRootsInProducts'])
		expectSimplifyToGive(product(root(x, 3), root(y, 4)), product(root(x, 3), root(y, 4)), ['combineRootsInProducts'])
	})

	test('pulls exponents into roots', () => {
		expectSimplifyToGive(power(sqrt(x), 3), sqrt(power(x, 3)), ['moveExponentsIntoRoots'])
		expectSimplifyToGive(power(root(x, 3), 2), root(power(x, 2), 3), ['moveExponentsIntoRoots'])
		expectSimplifyToGive(power(sqrt(sum(x, y)), z), sqrt(power(sum(x, y), z)), ['moveExponentsIntoRoots'])
	})

	test('pulls factors out of roots', () => {
		expectSimplifyToGive(sqrt(20), product(2, sqrt(5)), ['simplifyUnitExponentPowers', 'extractFactorsFromRoots'])
		expectSimplifyToGive(root(54, 3), product(3, root(2, 3)), ['simplifyUnitExponentPowers', 'extractFactorsFromRoots'])
		expectSimplifyToGive(sqrt(product(power(x, 3), power(y, 4), power(z, 5))), product(x, power(y, 2), power(z, 2), sqrt(product(x, z))), ['simplifyUnitExponentPowers', 'extractFactorsFromRoots'])
		expectSimplifyToGive(root(product(power(x, 4), power(y, 5)), 3), product(x, y, root(product(x, power(y, 2)), 3)), ['simplifyUnitExponentPowers', 'extractFactorsFromRoots'])
	})

	test('prevents root denominators', () => {
		expectSimplifyToGive(fraction(1, sqrt(2)), fraction(sqrt(2), 2), ['combineNumbersInSums', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'rationalizeRootDenominators'])
		expectSimplifyToGive(fraction(x, sqrt(y)), fraction(product(x, sqrt(y)), y), ['combineNumbersInSums', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'rationalizeRootDenominators'])
		expectSimplifyToGive(fraction(1, root(x, 3)), fraction(root(power(x, 2), 3), x), ['combineNumbersInSums', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'rationalizeRootDenominators'])
		expectSimplifyToGive(fraction(1, product(2, sqrt(x))), fraction(sqrt(x), product(2, x)), ['combineNumbersInSums', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'rationalizeRootDenominators'])
	})
})
