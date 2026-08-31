import { Integer, power, product, sum, variable } from '../../../construction/index.ts'

import { areNodesEqual } from '../../structural/index.ts'

import { differentiate } from './differentiate.ts'

describe('differentiate', () => {
	test('dispatches derivative rules recursively', () => {
		const x = variable('x')
		const result = differentiate(product(3, power(x, 2)), x)
		expect(areNodesEqual(result, product(3, 2, power(x, sum(2, -1))), false)).toBe(true)
	})

	test('returns zero for expressions independent of the variable', () => {
		expect(differentiate(variable('y'), 'x')).toBe(Integer.zero)
	})
})
