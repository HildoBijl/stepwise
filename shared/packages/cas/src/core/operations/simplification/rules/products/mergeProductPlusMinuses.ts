import { type ExpressionNode, type Product, plusMinus, product } from '../../../../construction'

import { isPlusMinus } from '../../../structural'

export function mergeProductPlusMinuses(node: Product): ExpressionNode {
	return node.factors.some(factor => isPlusMinus(factor)) ? plusMinus(product(...node.factors.map(factor => isPlusMinus(factor) ? factor.node : factor))) : node
}
