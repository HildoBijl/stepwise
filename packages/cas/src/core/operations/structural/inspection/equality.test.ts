import { negative, power, product, sum, variable } from '../../../construction'

import { areNodesEqual } from './equality'

describe('structural node equality', () => {
	test('compares all relevant node data', () => {
		expect(areNodesEqual(variable('x', '1'), variable('x', '1'))).toBe(true)
		expect(areNodesEqual(variable('x', '1'), variable('x', '2'))).toBe(false)
		expect(areNodesEqual(negative(power('x', 2)), negative(power('x', 2)))).toBe(true)
	})

	test('can ignore list order', () => {
		expect(areNodesEqual(sum('x', 'y'), sum('y', 'x'))).toBe(true)
		expect(areNodesEqual(sum('x', 'y'), sum('y', 'x'), false)).toBe(false)
		expect(areNodesEqual(product('x', 'y'), product('y', 'x'))).toBe(true)
	})
})
