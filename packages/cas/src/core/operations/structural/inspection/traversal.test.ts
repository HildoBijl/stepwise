import { power, product, sum } from '../../../construction'

import { countNodes, everyNode, findNode, forEachNode, getNodes, someChild, someNode } from './traversal'
import { isPower, isProduct, isSum, isVariable } from './typeChecks'

const expression = sum('x', product('y', power('z', 2)))

describe('tree traversal', () => {
	test('distinguishes children from all nodes', () => {
		expect(someChild(expression, isPower)).toBe(false)
		expect(someNode(expression, isPower)).toBe(true)
		expect(everyNode(expression, node => !isVariable(node), { includeSelf: false })).toBe(false)
	})

	test('supports root inclusion', () => {
		expect(someNode(expression, isSum)).toBe(true)
		expect(someNode(expression, isSum, { includeSelf: false })).toBe(false)
		expect(getNodes(expression, { includeSelf: false })).toHaveLength(6)
		expect(countNodes(expression, isPower)).toBe(1)
	})

	test('provides ancestors and traversal order', () => {
		const found = findNode(expression, isPower)
		expect(found).toBe(expression.children[1].children[1])
		const order: string[] = []
		forEachNode(expression, node => order.push(node.subtype), { childrenFirst: true })
		expect(order.at(-1)).toBe(expression.subtype)
	})

	test('finds typed nodes', () => {
		expect(findNode(expression, isProduct)?.factors).toHaveLength(2)
	})
})
