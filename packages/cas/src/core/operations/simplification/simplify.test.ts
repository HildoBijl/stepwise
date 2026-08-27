import { product, sum } from '../../construction'
import { areNodesEqual } from '../structural'

import { simplify } from './simplify'

describe('simplify', () => {
	test('returns unchanged nodes when no rules are enabled', () => {
		const node = sum('x', 0)
		expect(simplify(node, {}, [])).toBe(node)
	})

	test('applies dependent rules to a fixed result', () => {
		const result = simplify(product(2, 3, 'x'), {}, ['combineNumbersInProducts'])
		expect(areNodesEqual(result, product(6, 'x'), false)).toBe(true)
	})
})
