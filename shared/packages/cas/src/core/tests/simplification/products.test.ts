import { variable, negative, plusMinus, minusPlus, sum, product, power } from '../../construction'

import { expectSimplifyToGive } from './testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('product simplification', () => {
	test('flattens products', () => {
		expectSimplifyToGive(product(x, product(y, z)), product(x, y, z), { flattenProducts: true })
		expectSimplifyToGive(product(product(x, y), product(z)), product(x, y, z), { flattenProducts: true })
	})

	test('merges product minuses', () => {
		expectSimplifyToGive(product(negative(x), y), negative(product(x, y)), { mergeProductMinuses: true })
		expectSimplifyToGive(product(negative(x), negative(y)), product(x, y), { mergeProductMinuses: true })
		expectSimplifyToGive(product(negative(x), negative(y), negative(z)), negative(product(x, y, z)), { mergeProductMinuses: true })
	})

	test('merges product plus-minuses', () => {
		expectSimplifyToGive(product(plusMinus(x), y), plusMinus(product(x, y)), { mergeProductMinuses: true, mergeProductPlusMinuses: true })
		expectSimplifyToGive(product(plusMinus(x), plusMinus(y)), plusMinus(product(x, y)), { mergeProductMinuses: true, mergeProductPlusMinuses: true })
		expectSimplifyToGive(product(minusPlus(x), y), minusPlus(product(x, y)), { mergeProductMinuses: true, mergeProductPlusMinuses: true })
		expectSimplifyToGive(product(minusPlus(x), plusMinus(y)), minusPlus(product(x, y)), { mergeProductMinuses: true, mergeProductPlusMinuses: true })
		expectSimplifyToGive(product(minusPlus(x), minusPlus(y)), plusMinus(product(x, y)), { mergeProductMinuses: true, mergeProductPlusMinuses: true })
	})

	test('removes times zero from products', () => {
		expectSimplifyToGive(product(x, 0), 0, { removeTimesZeroFromProduct: true })
		expectSimplifyToGive(product(0, x, y), 0, { removeTimesZeroFromProduct: true })
	})

	test('removes times one from products', () => {
		expectSimplifyToGive(product(x, 1), product(x), { removeTimesOneFromProducts: true })
		expectSimplifyToGive(product(1, x, 1), product(x), { removeTimesOneFromProducts: true })
	})

	test('merges product numbers', () => {
		expectSimplifyToGive(product(2, x, 3), product(6, x), { mergeProductNumbers: true })
		expectSimplifyToGive(product(2, x, -3, 5), product(10, x, -3), { mergeProductNumbers: true })
		expectSimplifyToGive(product(2, x, 0), product(0, x), { mergeProductNumbers: true })
		expectSimplifyToGive(product(2, 3), product(6), { mergeProductNumbers: true })
	})

	test('merges product factors', () => {
		expectSimplifyToGive(product(x, x), power(x, sum(1, 1)), { mergeProductFactors: true })
		expectSimplifyToGive(product(x, power(x, 2)), power(x, sum(1, 2)), { mergeProductFactors: true })
		expectSimplifyToGive(product(x, power(x, 2), power(x, 3), x), power(x, sum(1, 2, 3, 1)), { mergeProductFactors: true })
		expectSimplifyToGive(product(x, y, x), product(power(x, sum(1, 1)), y), { mergeProductFactors: true })
	})

	test('expands products of sums', () => {
		expectSimplifyToGive(product(x, sum(y, z)), sum(product(x, y), product(x, z)), { expandProductsOfSums: true })
		expectSimplifyToGive(product(sum(x, y), z), sum(product(x, z), product(y, z)), { expandProductsOfSums: true })
		expectSimplifyToGive(product(sum(x, y), sum(y, z)), sum(sum(product(x, y), product(x, z)), sum(product(y, y), product(y, z))), { expandProductsOfSums: true })
	})

	test('sorts products', () => {
		expectSimplifyToGive(product(x, 2), product(2, x), { sortProducts: true })
		expectSimplifyToGive(product(y, x), product(x, y), { sortProducts: true })
		expectSimplifyToGive(product(sum(x, y), x, 2), product(2, x, sum(x, y)), { sortProducts: true })
		expectSimplifyToGive(product(y, 3, x, 2), product(2, 3, x, y), { sortProducts: true })
	})
})
