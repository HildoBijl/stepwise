import { cartesianProduct } from '@step-wise/utils'

import { type ExpressionNode, negative } from '../../../construction'

import { isPlusMinusSign } from '../checks'

export function expandToSingulars(node: ExpressionNode): ExpressionNode[] {
	// Turn a plus/minus sign into a list of options.
	if (isPlusMinusSign(node)) {
		const positive = node.negative ? negative(node.node) : node.node
		const negativeNode = node.negative ? node.node : negative(node.node)
		return [...expandToSingulars(positive), ...expandToSingulars(negativeNode)]
	}

	// Apply the expansion to children.
	if (node.children.length === 0) return [node]
	const childExpansions = node.children.map(expandToSingulars)
	if (childExpansions.every((expansion, index) => expansion.length === 1 && expansion[0] === node.children[index])) return [node]
	return cartesianProduct(childExpansions).map(children => node.recreateWithChildren(children))
}
