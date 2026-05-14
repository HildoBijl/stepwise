import { negative, variable, sum, product, power } from '../../../construction'
import { simplify, applyExpansions } from '../../../operations'

import { expectNodeToEqual } from '../testUtils'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('apply-expansions simplification', () => {
	test('expands minus sums', () => {
		expectNodeToEqual(simplify(negative(sum(x, y)), undefined, applyExpansions), sum(negative(x), negative(y)))
	})

	test('expands products of sums', () => {
		expectNodeToEqual(simplify(product(x, sum(y, z)), undefined, applyExpansions), sum(product(x, y), product(x, z)))
	})

	test('expands powers of sums', () => {
		expectNodeToEqual(simplify(power(sum(x, y), 2), undefined, applyExpansions), sum(power(x, 2), product(2, x, y), power(y, 2)))
	})
})
