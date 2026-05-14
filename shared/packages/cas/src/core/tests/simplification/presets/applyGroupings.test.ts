import { variable, sum, product, fraction, power } from '../../../construction'
import { simplify, applyGroupings } from '../../../operations'

import { expectNodeToEqual } from '../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('apply-groupings simplification', () => {
	test('groups sum terms', () => {
		expectNodeToEqual(simplify(sum(product(2, x), product(3, x)), undefined, applyGroupings), product(5, x))
	})

	test('merges product factors', () => {
		expectNodeToEqual(simplify(product(x, power(x, 2)), undefined, applyGroupings), power(x, 3))
	})

	test('merges fraction products', () => {
		expectNodeToEqual(simplify(product(fraction(x, y), fraction(z, 2)), undefined, applyGroupings), fraction(product(x, z), product(y, 2)))
	})
})
