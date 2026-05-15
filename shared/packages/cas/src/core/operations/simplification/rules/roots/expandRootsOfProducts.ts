import { type ExpressionNode, type RootLike, product } from '../../../../construction'

import { isProduct } from '../../../structural'

export function expandRootsOfProducts(node: RootLike): ExpressionNode {
	return isProduct(node.radicand) ? product(...node.radicand.factors.map(factor => node.recreateWith(factor))) : node
}
