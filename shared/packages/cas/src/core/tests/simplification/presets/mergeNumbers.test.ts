import { Integer, variable, sum, product, fraction, power, sqrt } from '../../../construction'
import { simplify, mergeNumbers } from '../../../operations'

import { expectNodeToEqual } from '../../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('merge-numbers simplification', () => {
	test('merges numbers in sums and products', () => {
		expectNodeToEqual(simplify(sum(2, x, 3), undefined, mergeNumbers), sum(x, 5))
		expectNodeToEqual(simplify(product(2, x, 3), undefined, mergeNumbers), product(6, x))
	})

	test('merges numbers in fractions and powers', () => {
		expectNodeToEqual(simplify(fraction(6, 9), undefined, mergeNumbers), fraction(2, 3))
		expectNodeToEqual(simplify(power(2, 3), undefined, mergeNumbers), Integer.eight)
	})

	test('reduces integer roots', () => {
		expectNodeToEqual(simplify(sqrt(25), undefined, mergeNumbers), Integer.five)
		expectNodeToEqual(simplify(sqrt(24), undefined, mergeNumbers), sqrt(24))
	})
})
