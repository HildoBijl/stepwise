import { number, variable, sum, product, power, sqrt } from '../../../construction'
import { simplify, factorize } from '../../../operations'

import { expectNodeToEqual } from '../../testUtils'

const x = variable('x')
const y = variable('y')

describe('factorize simplification', () => {
	test('factorizes integers', () => {
		expectNodeToEqual(simplify(number(10), undefined, factorize), product(2, 5))
		expectNodeToEqual(simplify(number(12), undefined, factorize), product(power(2, 2), 3))
		expectNodeToEqual(simplify(number(16), undefined, factorize), power(2, 4))
		expectNodeToEqual(simplify(number(1600), undefined, factorize), product(power(2, 6), power(5, 2)))
	})

	test('pulls out common sum factors', () => {
		expectNodeToEqual(simplify(sum(product(6, power(x, 2)), product(9, x, y)), undefined, factorize), product(3, x, sum(product(2, x), product(3, y))))
	})

	test('pulls factors out of roots', () => {
		expectNodeToEqual(simplify(sqrt(20), undefined, factorize), product(2, sqrt(5)))
	})
})
