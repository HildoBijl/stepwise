import { type SignNode, plusMinus } from '../../../../construction'

import { isSignNode, isPlusMinus } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: SignNode): SignNode {
	if (isSignNode(node.node) && (isPlusMinus(node) || isPlusMinus(node.node))) return plusMinus(node.node.node)
	return node
}

export const removeDoubleSigns = defineRule({
	appliesTo: isSignNode,
	transform,
	requires: ['removeDoubleNegatives'],
})
