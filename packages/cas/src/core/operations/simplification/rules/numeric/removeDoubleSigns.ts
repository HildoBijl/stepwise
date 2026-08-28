import { type SignNode, plusMinus } from '../../../../construction/index.ts'

import { isSignNode, isPlusMinus } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

import { removeDoubleNegatives } from './removeDoubleNegatives.ts'

function transform(node: SignNode): SignNode {
	if (isSignNode(node.node) && (isPlusMinus(node) || isPlusMinus(node.node))) return plusMinus(node.node.node)
	return node
}

export const removeDoubleSigns = defineRule({
	name: 'removeDoubleSigns',
	appliesTo: isSignNode,
	transform,
	requires: [removeDoubleNegatives],
})
