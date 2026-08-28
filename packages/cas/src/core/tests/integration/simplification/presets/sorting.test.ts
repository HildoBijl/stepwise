import { variable, sum, product } from '../../../../construction/index.ts'
import { simplify, sort } from '../../../../operations/index.ts'

import { expectNodeToEqual } from '../../../testUtils.ts'

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
