import { negative, plusMinus, variable, sum, product, power } from '../../../../construction/index.ts'

import { expectSimplifyToGive } from '../../../testUtils.ts'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('sum simplification', () => {
	test('flattens sums', () => {
		expectSimplifyToGive(sum(x, sum(y, z)), sum(x, y, z), ['flattenSums'])
		expectSimplifyToGive(sum(sum(x, y), sum(z)), sum(x, y, z), ['flattenSums'])
	})

	test('removes plus zero from sums', () => {
		expectSimplifyToGive(sum(x, 0), sum(x), ['removeZeroesFromSums'])
		expectSimplifyToGive(sum(0, x, 0), sum(x), ['removeZeroesFromSums'])
	})

	test('merges sum numbers', () => {
		expectSimplifyToGive(sum(2, x, 3), sum(x, 5), ['combineNumbersInSums'])
		expectSimplifyToGive(sum(2, x, -5), sum(x, -3), ['combineNumbersInSums'])
		expectSimplifyToGive(sum(3, x, -3), sum(x, 0), ['combineNumbersInSums'])
		expectSimplifyToGive(sum(2, 3), sum(5), ['combineNumbersInSums'])
	})

	test('cancels sum terms', () => {
		expectSimplifyToGive(sum(x, negative(x)), sum(), ['cancelSumTerms'])
		expectSimplifyToGive(sum(x, y, negative(x)), sum(y), ['cancelSumTerms'])
	})

	test('groups sum terms', () => {
		expectSimplifyToGive(sum(product(2, x), product(3, x)), product(sum(2, 3), x), ['combineLikeTerms'])
		expectSimplifyToGive(sum(product(2, x), y, product(3, x)), sum(product(sum(2, 3), x), y), ['combineLikeTerms'])
		expectSimplifyToGive(sum(product(2, x), y, product(-2, x)), sum(product(sum(2, -2), x), y), ['combineLikeTerms'])
		expectSimplifyToGive(sum(product(2, x, y), product(3, y, x)), product(sum(2, 3), product(x, y)), ['combineLikeTerms'])
	})

	test('expands minus sums', () => {
		expectSimplifyToGive(negative(sum(x, y)), sum(negative(x), negative(y)), ['expandMinusSums'])
		expectSimplifyToGive(negative(sum(x, y, z)), sum(negative(x), negative(y), negative(z)), ['expandMinusSums'])
		expectSimplifyToGive(negative(sum(x, negative(y))), sum(negative(x), negative(negative(y))), ['expandMinusSums'])
	})

	test('expands plus-minus sums', () => {
		expectSimplifyToGive(plusMinus(sum(x, y)), sum(plusMinus(x), plusMinus(y)), ['expandPlusMinusSums'])
		expectSimplifyToGive(plusMinus(sum(x, y, z)), sum(plusMinus(x), plusMinus(y), plusMinus(z)), ['expandPlusMinusSums'])
		expectSimplifyToGive(plusMinus(sum(x, negative(y))), sum(plusMinus(x), plusMinus(negative(y))), ['expandPlusMinusSums'])
	})

	test('pulls out common sum numbers', () => {
		expectSimplifyToGive(sum(product(6, x), product(9, y)), product(3, sum(product(2, x), product(3, y))), ['factorCommonNumericTerms'])
		expectSimplifyToGive(sum(product(4, x), product(10, y), 6), product(2, sum(product(2, x), product(5, y), 3)), ['factorCommonNumericTerms'])
		expectSimplifyToGive(sum(product(5, x), product(7, y)), sum(product(5, x), product(7, y)), ['factorCommonNumericTerms'])
	})

	test('pulls out common sum factors', () => {
		expectSimplifyToGive(sum(product(x, y), product(x, z)), product(x, sum(y, z)), ['combineLikeFactors', 'expandMinusSums', 'cancelSumTerms', 'simplifyZeroExponentPowers', 'removeOnesFromProducts', 'simplifyUnitExponentPowers','factorCommonFactors', 'removeDoubleNegatives', 'flattenSums', 'flattenProducts'])
		expectSimplifyToGive(sum(product(x, y, z), product(x, y)), product(x, y, sum(z, 1)), ['combineLikeFactors', 'expandMinusSums', 'cancelSumTerms', 'simplifyZeroExponentPowers', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'factorCommonFactors', 'removeDoubleNegatives', 'flattenSums', 'flattenProducts'])
		expectSimplifyToGive(sum(product(x, y), product(x, z), x), product(x, sum(y, z, 1)), ['combineLikeFactors', 'expandMinusSums', 'cancelSumTerms', 'simplifyZeroExponentPowers', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'factorCommonFactors', 'removeDoubleNegatives', 'flattenSums', 'flattenProducts'])
		expectSimplifyToGive(sum(product(x, y), product(z, y)), product(y, sum(x, z)), ['combineLikeFactors', 'expandMinusSums', 'cancelSumTerms', 'simplifyZeroExponentPowers', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'factorCommonFactors', 'removeDoubleNegatives', 'flattenSums', 'flattenProducts'])
		expectSimplifyToGive(sum(product(x, y), product(x, y)), product(x, y, sum(1, 1)), ['combineLikeFactors', 'expandMinusSums', 'cancelSumTerms', 'simplifyZeroExponentPowers', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'factorCommonFactors', 'removeDoubleNegatives', 'flattenSums', 'flattenProducts'])
		expectSimplifyToGive(sum(power(x, 4), power(x, sum(y, 2))), product(power(x, 2), sum(power(x, sum(4, -2)), power(x, y))), ['combineLikeFactors', 'expandMinusSums', 'cancelSumTerms', 'simplifyZeroExponentPowers', 'removeOnesFromProducts', 'simplifyUnitExponentPowers', 'factorCommonFactors', 'removeDoubleNegatives', 'flattenSums', 'flattenProducts'])
	})

	test('sorts sums', () => {
		expectSimplifyToGive(sum(-2, x), sum(x, -2), ['sortSums'])
		expectSimplifyToGive(sum(y, x), sum(x, y), ['sortSums'])
		expectSimplifyToGive(sum(x, 1, power(x, 2)), sum(power(x, 2), x, 1), ['sortSums'])
		expectSimplifyToGive(sum(1, x, y, power(x, 2), power(y, 2), product(x, y)), sum(power(x, 2), product(x, y), x, power(y, 2), y, 1), ['sortSums'], undefined)
	})
})
