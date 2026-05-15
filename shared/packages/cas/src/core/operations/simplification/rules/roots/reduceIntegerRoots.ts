import { isPerfectPower } from '@step-wise/math-tools'

import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isIntegerNode } from '../../../structural'

export function reduceIntegerRoots(node: RootLike): ExpressionNode {
	if (!isIntegerNode(node.radicand) || !isIntegerNode(node.degree)) return node
	if (isPerfectPower(node.radicand.value, node.degree.value)) return new Integer(Math.round(node.radicand.value ** (1 / node.degree.value)))
	return node
}
