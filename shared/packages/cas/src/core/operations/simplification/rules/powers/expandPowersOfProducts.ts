import { type ExpressionNode, type Power, power, product } from '../../../../construction'

import { isProduct } from '../../../structural'

export function expandPowersOfProducts(node: Power): ExpressionNode {
	return isProduct(node.base) ? product(...node.base.factors.map(factor => power(factor, node.exponent))) : node
}
