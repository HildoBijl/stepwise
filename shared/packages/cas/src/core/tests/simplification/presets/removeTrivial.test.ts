import { Float, Integer, negative, variable, sum, product, fraction, power, sqrt } from '../../../construction'
import { simplify, removeTrivial } from '../../../operations'

import { expectNodeToEqual } from '../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('remove-trivial simplification', () => {
	test('fixes basic structure', () => {
		expectNodeToEqual(simplify(sum(x, sum(y, z)), undefined, removeTrivial), sum(x, y, z))
		expectNodeToEqual(simplify(product(x, product(y, z)), undefined, removeTrivial), product(x, y, z))
		expectNodeToEqual(simplify(new Float(3), undefined, removeTrivial), Integer.three)
	})

	test('removes trivial signs', () => {
		expectNodeToEqual(simplify(negative(negative(x)), undefined, removeTrivial), x)
		expectNodeToEqual(simplify(negative(Integer.zero), undefined, removeTrivial), Integer.zero)
		expectNodeToEqual(simplify(product(negative(x), negative(y)), undefined, removeTrivial), product(x, y))
		expectNodeToEqual(simplify(fraction(negative(x), negative(y)), undefined, removeTrivial), fraction(x, y))
	})

	test('removes trivial zeros and ones', () => {
		expectNodeToEqual(simplify(sum(x, 0), undefined, removeTrivial), x)
		expectNodeToEqual(simplify(product(x, 1), undefined, removeTrivial), x)
		expectNodeToEqual(simplify(product(x, 0), undefined, removeTrivial), Integer.zero)
		expectNodeToEqual(simplify(fraction(0, x), undefined, removeTrivial), Integer.zero)
		expectNodeToEqual(simplify(fraction(x, 1), undefined, removeTrivial), x)
		expectNodeToEqual(simplify(power(x, 0), undefined, removeTrivial), Integer.one)
		expectNodeToEqual(simplify(power(x, 1), undefined, removeTrivial), x)
		expectNodeToEqual(simplify(sqrt(0), undefined, removeTrivial), Integer.zero)
		expectNodeToEqual(simplify(sqrt(1), undefined, removeTrivial), Integer.one)
	})
})
