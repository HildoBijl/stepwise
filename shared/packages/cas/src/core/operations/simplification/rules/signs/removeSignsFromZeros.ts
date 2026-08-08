import { isSignNode, isZero } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type SignNode, type ConstantNode } from '../../../../construction'

function transform(node: SignNode): ConstantNode | SignNode {
	return isZero(node.node) ? node.node : node
}

export const removeSignsFromZeros = defineRule({
	appliesTo: isSignNode,
	transform,
})
