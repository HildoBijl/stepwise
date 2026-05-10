import { type ExpressionNode, type Sign, negative, sum } from '../../../../construction'

import { isNegativeSign, isSum } from '../../../structural'

export function expandMinusSums(node: Sign): ExpressionNode {
	if (!isNegativeSign(node) || !isSum(node.node)) return node
	return sum(...node.node.terms.map(negative))
}
