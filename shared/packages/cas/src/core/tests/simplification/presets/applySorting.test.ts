import { variable, sum, product } from '../../../construction'
import { simplify, applySorting } from '../../../operations'

import { expectNodeToEqual } from '../testUtils'

const x = variable('x')
const y = variable('y')

describe('apply-sorting simplification', () => {
	test('sorts sums', () => {
		expectNodeToEqual(simplify(sum(2, x), undefined, applySorting), sum(x, 2))
	})

	test('sorts products', () => {
		expectNodeToEqual(simplify(product(y, 2, x), undefined, applySorting), product(2, x, y))
	})
})
