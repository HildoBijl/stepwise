import { repeat } from '@step-wise/utils'

import { type ExpressionNode, type Power, product } from '../../../../construction'

import { isIntegerNode } from '../../../structural'

export function expandPowers(node: Power): ExpressionNode {
	if (!isIntegerNode(node.exponent)) return node
	return product(...repeat(node.exponent.value, () => node.base))
}
