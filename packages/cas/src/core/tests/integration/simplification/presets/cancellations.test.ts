import { Integer, negative, variable, sum, product, fraction, power, sqrt } from '../../../../construction/index.ts'
import { simplify, cancel } from '../../../../operations/index.ts'

import { expectNodeToEqual } from '../../../testUtils.ts'

const x = variable('x')
const y = variable('y')
const z = variable('z')

describe('apply-cancellations simplification', () => {
	test('cancels sum terms', () => {
		expectNodeToEqual(simplify(sum(x, negative(x)), undefined, cancel), Integer.zero)
	})

	test('cancels fraction factors', () => {
		expectNodeToEqual(simplify(fraction(product(x, y), product(x, z)), undefined, cancel), fraction(y, z))
	})

	test('reduces canceled roots', () => {
		expectNodeToEqual(simplify(sqrt(power(x, 2)), undefined, cancel), x)
	})
})
