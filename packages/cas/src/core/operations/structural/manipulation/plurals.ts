import { cartesianProduct } from '@step-wise/utils'

import { type ExpressionNode, negative } from '../../../construction'

import { isPlusMinus } from '../fundamentals'

export function expandToSingulars(node: ExpressionNode): ExpressionNode[] {
	// Turn a plus/minus sign into a list of options.
	if (isPlusMinus(node)) return [...expandToSingulars(node.node), ...expandToSingulars(negative(node.node))]

	// Apply the expansion to children.
	if (node.children.length === 0) return [node]
	const childExpansions = node.children.map(expandToSingulars)
	if (childExpansions.every((expansion, index) => expansion.length === 1 && expansion[0] === node.children[index])) return [node]
	return cartesianProduct(childExpansions).map(children => node.recreateWithChildren(children))
}
