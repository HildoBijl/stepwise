import { product, sum } from '../../construction/index.ts'

import { areNodesEqual } from '../structural/index.ts'

import { simplify } from './simplify.ts'

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
