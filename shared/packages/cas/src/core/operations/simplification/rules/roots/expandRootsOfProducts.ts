import { type ExpressionNode, product } from '../../../../construction'

import { isProduct } from '../../../structural'

import { type RootLike, recreateRootLike } from '../utils'

export function expandRootsOfProducts(node: RootLike): ExpressionNode {
	return isProduct(node.argument) ? product(...node.argument.factors.map(factor => recreateRootLike(node, factor))) : node
}
