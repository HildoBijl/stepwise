import { type ExpressionNode, type Root, type Sqrt, root, sqrt } from '../../../../construction'

import { isRoot, isSqrt } from '../../../structural'

export type RootLike = Root | Sqrt

export function isRootLike(node: ExpressionNode): node is RootLike {
	return isRoot(node) || isSqrt(node)
}

export function recreateRootLike(original: RootLike, newArgument: ExpressionNode, newBase = original.base): RootLike {
	return isSqrt(original) ? sqrt(newArgument) : root(newArgument, newBase)
}
