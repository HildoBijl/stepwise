import { type ExpressionNode, type Product, plusMinus, minusPlus, product } from '../../../../construction'

import { isPlusMinusSign } from '../../../structural'

export function mergeProductPlusMinuses(node: Product): ExpressionNode {
	if (!node.factors.some(factor => isPlusMinusSign(factor))) return node
	let negativeCount = 0
	const factors = node.factors.map(factor => {
		if (!isPlusMinusSign(factor)) return factor
		if (factor.negative) negativeCount++
		return factor.node
	})
	return (negativeCount % 2 === 0 ? plusMinus : minusPlus)(product(...factors))
}
