import { type SignNode, type ConstantNode } from '../../../../construction/index.ts'

import { isSignNode, isZero } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: SignNode): ConstantNode | SignNode {
	return isZero(node.node) ? node.node : node
}

export const removeSignsFromZero = defineRule({
	name: 'removeSignsFromZero',
	appliesTo: isSignNode,
	transform,
})
