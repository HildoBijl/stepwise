import { fraction, negative, product, sum } from '../../../construction/index.ts'

import { areNodesEqual } from '../inspection/index.ts'

import { add, divide, multiply, subtract } from './arithmetic.ts'

describe('structural arithmetic operations', () => {
	test('creates sums, differences, products, and quotients', () => {
		expect(areNodesEqual(add('x', 'y', 2), sum('x', 'y', 2), false)).toBe(true)
		expect(areNodesEqual(subtract('x', 'y'), sum('x', negative('y')), false)).toBe(true)
		expect(areNodesEqual(multiply(2, 'x', 'y'), product(2, 'x', 'y'), false)).toBe(true)
		expect(areNodesEqual(divide('x', 3), fraction('x', 3), false)).toBe(true)
	})
})
