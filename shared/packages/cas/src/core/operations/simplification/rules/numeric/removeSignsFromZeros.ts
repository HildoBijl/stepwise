import { type SignNode, type ConstantNode } from '../../../../construction'

import { isSignNode, isZero } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: SignNode): ConstantNode | SignNode {
	return isZero(node.node) ? node.node : node
}

export const removeSignsFromZeros = defineRule({
	name: 'removeSignsFromZeros',
	appliesTo: isSignNode,
	transform,
})
