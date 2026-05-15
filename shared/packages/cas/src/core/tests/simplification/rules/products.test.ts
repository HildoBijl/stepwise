import { variable, negative, plusMinus, sum, product, power } from '../../../construction'

import { expectSimplifyToGive } from '../../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('product simplification', () => {
	test('flattens products', () => {
		expectSimplifyToGive(product(x, product(y, z)), product(x, y, z), ['flattenProducts'])
		expectSimplifyToGive(product(product(x, y), product(z)), product(x, y, z), ['flattenProducts'])
	})

	test('merges product minuses', () => {
		expectSimplifyToGive(product(negative(x), y), negative(product(x, y)), ['mergeProductMinuses'])
		expectSimplifyToGive(product(negative(x), negative(y)), product(x, y), ['mergeProductMinuses'])
		expectSimplifyToGive(product(negative(x), negative(y), negative(z)), negative(product(x, y, z)), ['mergeProductMinuses'])
	})

	test('merges product plus-minuses', () => {
		expectSimplifyToGive(product(plusMinus(x), y), plusMinus(product(x, y)), ['mergeProductMinuses', 'mergeProductPlusMinuses'])
		expectSimplifyToGive(product(plusMinus(x), plusMinus(y)), plusMinus(product(x, y)), ['mergeProductMinuses', 'mergeProductPlusMinuses'])
		expectSimplifyToGive(product(plusMinus(x), y, plusMinus(z)), plusMinus(product(x, y, z)), ['mergeProductMinuses', 'mergeProductPlusMinuses'])
	})

	test('removes times zero from products', () => {
		expectSimplifyToGive(product(x, 0), 0, ['reduceProductsWithZero'])
		expectSimplifyToGive(product(0, x, y), 0, ['reduceProductsWithZero'])
	})

	test('removes times one from products', () => {
		expectSimplifyToGive(product(x, 1), product(x), ['removeOnesFromProducts'])
		expectSimplifyToGive(product(1, x, 1), product(x), ['removeOnesFromProducts'])
	})

	test('merges product numbers', () => {
		expectSimplifyToGive(product(x, 3), product(3, x), ['mergeProductNumbers'])
		expectSimplifyToGive(product(2, x, 3), product(6, x), ['mergeProductNumbers'])
		expectSimplifyToGive(product(2, x, -3, 5), product(10, x, -3), ['mergeProductNumbers'])
		expectSimplifyToGive(product(2, x, 0), product(0, x), ['mergeProductNumbers'])
		expectSimplifyToGive(product(2, 3), product(6), ['mergeProductNumbers'])
	})

	test('merges product factors', () => {
		expectSimplifyToGive(product(x, x), power(x, sum(1, 1)), ['mergeProductFactors'])
		expectSimplifyToGive(product(x, power(x, 2)), power(x, sum(1, 2)), ['mergeProductFactors'])
		expectSimplifyToGive(product(x, power(x, 2), power(x, 3), x), power(x, sum(1, 2, 3, 1)), ['mergeProductFactors'])
		expectSimplifyToGive(product(x, y, x), product(power(x, sum(1, 1)), y), ['mergeProductFactors'])
	})

	test('expands products of sums', () => {
		expectSimplifyToGive(product(x, sum(y, z)), sum(product(x, y), product(x, z)), ['expandProductsOfSums'])
		expectSimplifyToGive(product(sum(x, y), z), sum(product(x, z), product(y, z)), ['expandProductsOfSums'])
		expectSimplifyToGive(product(sum(x, y), sum(y, z)), sum(sum(product(x, y), product(x, z)), sum(product(y, y), product(y, z))), ['expandProductsOfSums'])
	})

	test('expands products of sums within sums', () => {
		expectSimplifyToGive(product(x, sum(y, z)), product(x, sum(y, z)), ['expandProductsOfSumsWithinSums'])
		expectSimplifyToGive(sum(product(x, sum(y, z)), 1), sum(sum(product(x, y), product(x, z)), 1), ['expandProductsOfSumsWithinSums'])
		expectSimplifyToGive(sum(1, product(sum(x, y), z)), sum(1, sum(product(x, z), product(y, z))), ['expandProductsOfSumsWithinSums'])
		expectSimplifyToGive(sum(product(x, sum(y, z)), product(y, sum(x, z))), sum(sum(product(x, y), product(x, z)), sum(product(y, x), product(y, z))), ['expandProductsOfSumsWithinSums'])
	})

	test('sorts products', () => {
		expectSimplifyToGive(product(x, 2), product(2, x), ['sortProducts'])
		expectSimplifyToGive(product(y, x), product(x, y), ['sortProducts'])
		expectSimplifyToGive(product(sum(x, y), x, 2), product(2, x, sum(x, y)), ['sortProducts'])
		expectSimplifyToGive(product(y, 3, x, 2), product(2, 3, x, y), ['sortProducts'])
	})
})
