import { fraction, negative, power, product, sum, variable } from '../../construction'

import { nodeToString } from './toString'

describe('nodeToString', () => {
	test('prints precedence and brackets unambiguously', () => {
		expect(nodeToString(product(2, sum('x', 1)))).toBe('2(x+1)')
		expect(nodeToString(power(sum('x', 1), 2))).toBe('(x+1)^2')
		expect(nodeToString(fraction(negative('x'), sum('y', 1)))).toBe('(-x)/(y+1)')
	})

	test('brackets complex subscripts', () => {
		expect(nodeToString(variable('x', '2_3'))).toBe('x_(2_3)')
	})
})
