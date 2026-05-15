import { variable, sum, product } from '../../../construction'
import { simplify, sort } from '../../../operations'

import { expectNodeToEqual } from '../../testUtils'

const x = variable('x')
const y = variable('y')

describe('apply-sorting simplification', () => {
	test('sorts sums', () => {
		expectNodeToEqual(simplify(sum(2, x), undefined, sort), sum(x, 2))
	})

	test('sorts products', () => {
		expectNodeToEqual(simplify(product(y, 2, x), undefined, sort), product(2, x, y))
	})
})
