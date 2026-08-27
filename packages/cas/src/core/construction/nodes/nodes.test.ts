import { areNodesEqual } from '../../operations'
import { power, product, sum, variable } from '../creation'

import { nodeToTree } from './nodeToTree'

describe('expression nodes', () => {
	test('exposes children in structural order', () => {
		const node = power(sum('x', 1), 2)
		expect(node.children).toEqual([node.base, node.exponent])
	})

	test('recreates nodes with new children', () => {
		const node = product('x', 'y')
		const recreated = node.recreateWithChildren([variable('a'), variable('b')])
		expect(areNodesEqual(recreated, product('a', 'b'), false)).toBe(true)
	})

	test('prints a diagnostic tree', () => {
		expect(nodeToTree(sum('x', 2))).toBe("sum(variable('x'), integer(2))")
	})
})
