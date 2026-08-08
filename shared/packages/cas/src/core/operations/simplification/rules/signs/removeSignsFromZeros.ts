import { type SignNode, type ConstantNode } from '../../../../construction'

import { isSignNode, isZero } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: SignNode): ConstantNode | SignNode {
	return isZero(node.node) ? node.node : node
}

export const removeSignsFromZeros = defineRule({
	appliesTo: isSignNode,
	transform,
})
