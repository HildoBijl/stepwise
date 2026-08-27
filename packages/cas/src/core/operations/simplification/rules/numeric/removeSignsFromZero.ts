import { type SignNode, type ConstantNode } from '../../../../construction'

import { isSignNode, isZero } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: SignNode): ConstantNode | SignNode {
	return isZero(node.node) ? node.node : node
}

export const removeSignsFromZero = defineRule({
	name: 'removeSignsFromZero',
	appliesTo: isSignNode,
	transform,
})
