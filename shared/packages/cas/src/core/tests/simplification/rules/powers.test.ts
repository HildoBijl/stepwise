import { variable, negative, sum, product, fraction, power } from '../../../construction'

import { expectSimplifyToGive } from '../../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('power simplification', () => {
	test('removes zero exponent from powers', () => {
		expectSimplifyToGive(power(x, 0), 1, ['reducePowersWithZeroExponent'])
		expectSimplifyToGive(power(sum(x, y), 0), 1, ['reducePowersWithZeroExponent'])
		expectSimplifyToGive(power(0, 0), power(0, 0), ['reducePowersWithZeroExponent'])
	})

	test('removes zero base from powers', () => {
		expectSimplifyToGive(power(0, 3), 0, ['reducePowersWithZeroBase'])
		expectSimplifyToGive(power(0, sum(x, y)), 0, ['reducePowersWithZeroBase'])
		expectSimplifyToGive(power(0, 0), power(0, 0), ['reducePowersWithZeroBase'])
	})

	test('removes one exponent from powers', () => {
		expectSimplifyToGive(power(x, 1), x, ['removeOneExponentsFromPowers'])
		expectSimplifyToGive(power(sum(x, y), 1), sum(x, y), ['removeOneExponentsFromPowers'])
	})

	test('removes one base from powers', () => {
		expectSimplifyToGive(power(1, x), 1, ['reducePowersWithOneBase'])
		expectSimplifyToGive(power(1, sum(x, y)), 1, ['reducePowersWithOneBase'])
	})

	test('merges power minuses', () => {
		expectSimplifyToGive(power(negative(x), 2), power(x, 2), ['mergePowerMinuses'])
		expectSimplifyToGive(power(negative(x), 3), negative(power(x, 3)), ['mergePowerMinuses'])
		expectSimplifyToGive(power(negative(sum(x, y)), 4), power(sum(x, y), 4), ['mergePowerMinuses'])
		expectSimplifyToGive(power(negative(sum(x, y)), 5), negative(power(sum(x, y), 5)), ['mergePowerMinuses'])
	})

	test('merges power numbers', () => {
		expectSimplifyToGive(power(2, 3), 8, ['reduceNumberPowers'])
		expectSimplifyToGive(power(3, 2), 9, ['reduceNumberPowers'])
		expectSimplifyToGive(power(5, 1), 5, ['reduceNumberPowers'])
		expectSimplifyToGive(power(x, 2), power(x, 2), ['reduceNumberPowers'])
	})

	test('removes powers within powers', () => {
		expectSimplifyToGive(power(power(x, 2), 3), power(x, product(2, 3)), ['removePowersWithinPowers'])
		expectSimplifyToGive(power(power(x, y), z), power(x, product(y, z)), ['removePowersWithinPowers'])
		expectSimplifyToGive(power(power(sum(x, y), 2), z), power(sum(x, y), product(2, z)), ['removePowersWithinPowers'])
	})

	test('removes negative powers', () => {
		expectSimplifyToGive(power(x, -2), fraction(1, power(x, 2)), ['convertNegativePowers'])
		expectSimplifyToGive(power(sum(x, y), -3), fraction(1, power(sum(x, y), 3)), ['convertNegativePowers'])
		expectSimplifyToGive(power(x, 2), power(x, 2), ['convertNegativePowers'])
	})

	test('expands powers', () => {
		expectSimplifyToGive(power(x, 2), product(x, x), ['expandPowers'])
		expectSimplifyToGive(power(x, 3), product(x, x, x), ['expandPowers'])
		expectSimplifyToGive(power(sum(x, y), 2), product(sum(x, y), sum(x, y)), ['expandPowers'])
	})

	test('expands powers of products', () => {
		expectSimplifyToGive(power(product(x, y), 2), product(power(x, 2), power(y, 2)), ['expandPowersOfProducts'])
		expectSimplifyToGive(power(product(x, y, z), 3), product(power(x, 3), power(y, 3), power(z, 3)), ['expandPowersOfProducts'])
	})

	test('expands powers of fractions', () => {
		expectSimplifyToGive(power(fraction(x, y), 2), fraction(power(x, 2), power(y, 2)), ['expandPowersOfFractions'])
		expectSimplifyToGive(power(fraction(x, sum(y, z)), 3), fraction(power(x, 3), power(sum(y, z), 3)), ['expandPowersOfFractions'])
	})

	test('expands powers of sums', () => {
		expectSimplifyToGive(power(sum(x, y), 2), sum(product(1, power(x, 2), power(y, 0)), product(2, power(x, 1), power(y, 1)), product(1, power(x, 0), power(y, 2))), ['expandPowersOfSums'])
		expectSimplifyToGive(power(sum(x, y), 3), sum(product(1, power(x, 3), power(y, 0)), product(3, power(x, 2), power(y, 1)), product(3, power(x, 1), power(y, 2)), product(1, power(x, 0), power(y, 3))), ['expandPowersOfSums'])
		expectSimplifyToGive(power(sum(x, y, z), 2), sum(power(x, 2), product(2, x, y), product(2, x, z), power(y, 2), product(2, y, z), power(z, 2)), ['flattenSums', 'flattenProducts', 'removeOnesFromProducts', 'reducePowersWithZeroExponent', 'removeOneExponentsFromPowers', 'expandProductsOfSums', 'expandPowersOfSums'])
	})

	test('expands powers of sums within sums', () => {
		expectSimplifyToGive(power(sum(x, y), 2), power(sum(x, y), 2), ['expandPowersOfSumsWithinSums'])
		expectSimplifyToGive(sum(power(sum(x, y), 2), z), sum(sum(product(1, power(x, 2), power(y, 0)), product(2, power(x, 1), power(y, 1)), product(1, power(x, 0), power(y, 2))), z), ['expandPowersOfSumsWithinSums'])
	})
})
