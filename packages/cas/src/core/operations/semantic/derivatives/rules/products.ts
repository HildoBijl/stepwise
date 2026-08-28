import { type ExpressionNode, type Product, product, sum } from '../../../../construction/index.ts'

import { type DerivativeContext } from '../types.ts'

export function getProductDerivative(node: Product, context: DerivativeContext): ExpressionNode {
	return sum(...node.factors.map((factor, index) => product(...node.factors.slice(0, index), context.differentiate(factor), ...node.factors.slice(index + 1))))
}
