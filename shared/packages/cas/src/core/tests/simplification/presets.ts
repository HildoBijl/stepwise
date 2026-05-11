import { Float, Integer, negative, variable, sum, product, fraction, power, sqrt } from '../../construction'
import { structureOnly, elementaryClean, removeUseless } from '../../operations'

import { expectNodeToEqual } from './testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('structure-only simplification', () => {
	test('flattens consecutive sums', () => {
		expectNodeToEqual(structureOnly(sum(x, sum(y, z))), sum(x, y, z))
		expectNodeToEqual(structureOnly(sum(sum(x, y), sum(z, x))), sum(x, y, z, x))
	})
	test('flattens consecutive products', () => {
		expectNodeToEqual(structureOnly(product(x, product(y, z))), product(x, y, z))
		expectNodeToEqual(structureOnly(product(product(x, y), product(z, x))), product(x, y, z, x))
	})
	test('turns integer-valued floats into integers', () => {
		expectNodeToEqual(structureOnly(new Float(3)), Integer.three)
		expectNodeToEqual(structureOnly(new Float(12)), Integer.twelve)
		expectNodeToEqual(structureOnly(new Float(3.5)), new Float(3.5))
	})
})

describe('elementary clean simplification', () => {
	test('flattens sums and products', () => {
		expectNodeToEqual(elementaryClean(sum(x, sum(y, z))), sum(x, y, z))
		expectNodeToEqual(elementaryClean(product(x, product(y, z))), product(x, y, z))
	})
	test('merges product minuses', () => {
		expectNodeToEqual(elementaryClean(product(negative(x), y)), negative(product(x, y)))
		expectNodeToEqual(elementaryClean(product(negative(x), negative(y))), product(x, y))
	})
	test('merges fraction minuses', () => {
		expectNodeToEqual(elementaryClean(fraction(negative(x), y)), negative(fraction(x, y)))
		expectNodeToEqual(elementaryClean(fraction(x, negative(y))), negative(fraction(x, y)))
		expectNodeToEqual(elementaryClean(fraction(negative(x), negative(y))), fraction(x, y))
	})
})

describe('remove-useless simplification', () => {
	test('removes double negatives and minus from zero', () => {
		expectNodeToEqual(removeUseless(negative(negative(x))), x)
		expectNodeToEqual(removeUseless(negative(0)), 0)
	})
	test('removes plus zero and times one', () => {
		expectNodeToEqual(removeUseless(sum(x, 0)), x)
		expectNodeToEqual(removeUseless(sum(0, x, 0)), x)
		expectNodeToEqual(removeUseless(product(x, 1)), x)
		expectNodeToEqual(removeUseless(product(1, x, 1)), x)
	})
	test('reduces products with zero', () => {
		expectNodeToEqual(removeUseless(product(x, 0, y)), 0)
		expectNodeToEqual(removeUseless(product(0, x)), 0)
	})
	test('reduces useless fractions', () => {
		expectNodeToEqual(removeUseless(fraction(0, x)), 0)
		expectNodeToEqual(removeUseless(fraction(x, 1)), x)
		expectNodeToEqual(removeUseless(fraction(x, -1)), negative(x))
	})
	test('reduces useless powers', () => {
		expectNodeToEqual(removeUseless(power(x, 0)), 1)
		expectNodeToEqual(removeUseless(power(0, x)), 0)
		expectNodeToEqual(removeUseless(power(x, 1)), x)
		expectNodeToEqual(removeUseless(power(1, x)), 1)
	})
	test('reduces roots with zero or one argument', () => {
		expectNodeToEqual(removeUseless(sqrt(0)), 0)
		expectNodeToEqual(removeUseless(sqrt(1)), 1)
	})
})
