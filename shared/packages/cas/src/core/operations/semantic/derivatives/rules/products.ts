import { type ExpressionNode, type Product, product, sum } from '../../../../construction'

import { type DerivativeContext } from '../types'

export function getProductDerivative(node: Product, context: DerivativeContext): ExpressionNode {
	return sum(...node.factors.map((factor, index) => product(...node.factors.slice(0, index), context.getDerivative(factor), ...node.factors.slice(index + 1))))
}
