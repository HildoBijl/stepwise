import { isPerfectPower } from '@step-wise/math-tools'

import { type ExpressionNode, Integer } from '../../../../construction'

import { isIntegerNode } from '../../../structural'

import { type RootLike } from '../utils'

export function reduceIntegerRoots(node: RootLike): ExpressionNode {
	if (!isIntegerNode(node.argument) || !isIntegerNode(node.base)) return node
	if (isPerfectPower(node.argument.value, node.base.value)) return new Integer(Math.round(node.argument.value ** (1 / node.base.value)))
	return node
}
