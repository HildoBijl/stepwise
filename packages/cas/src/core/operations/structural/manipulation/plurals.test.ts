import { type ExpressionNode, negative, plusMinus, product, sum, variable } from '../../../construction/index.ts'

import { areNodesEqual } from '../inspection/index.ts'

import { expandToSingulars } from './plurals.ts'

function expectEqualNodeLists(result: readonly ExpressionNode[], expected: readonly ExpressionNode[]) {
	expect(result).toHaveLength(expected.length)
	result.forEach((node, index) => expect(areNodesEqual(node, expected[index], false)).toBe(true))
}

describe('expandToSingulars', () => {
	test('keeps singular expressions unchanged', () => {
		expectEqualNodeLists(expandToSingulars(sum('x', 'y')), [sum('x', 'y')])
	})

	test('expands nested and repeated plus-minus signs', () => {
		expectEqualNodeLists(expandToSingulars(plusMinus('x')), [variable('x'), negative('x')])
		expectEqualNodeLists(expandToSingulars(product('x', plusMinus('y'))), [product('x', 'y'), product('x', negative('y'))])
		expectEqualNodeLists(expandToSingulars(sum('x', plusMinus('y'), plusMinus('z'))), [sum('x', 'y', 'z'), sum('x', 'y', negative('z')), sum('x', negative('y'), 'z'), sum('x', negative('y'), negative('z'))])
	})
})
