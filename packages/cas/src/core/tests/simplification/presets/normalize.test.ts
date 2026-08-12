import { negative, variable, sum, product, fraction, power } from '../../../construction'
import { simplify, normalize } from '../../../operations'

import { expectNodeToEqual } from '../../testUtils'

const x = variable('x')
const y = variable('y')

describe('normalize simplification', () => {
	test('normalizes fraction minuses', () => {
		expectNodeToEqual(simplify(fraction(sum(negative(x), 3), sum(5, negative(y))), undefined, normalize), fraction(sum(x, -3), sum(y, -5)))
	})

	test('applies polynomial cancellation', () => {
		expectNodeToEqual(simplify(fraction(sum(power(x, 2), product(3, x), 2), sum(power(x, 2), -1)), undefined, normalize), fraction(sum(x, 2), sum(x, -1)))
	})
})
