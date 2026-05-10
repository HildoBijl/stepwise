import { type ExpressionNode, type Sign, sum } from '../../../../construction'

import { isPlusMinusSign, isSum } from '../../../structural'

export function expandPlusMinusSums(node: Sign): ExpressionNode {
	if (!isPlusMinusSign(node) || !isSum(node.node)) return node
	return sum(...node.node.terms.map(term => node.recreateWith(term)))
}
