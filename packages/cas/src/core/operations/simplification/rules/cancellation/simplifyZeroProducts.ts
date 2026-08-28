import { type ExpressionNode, type Product, Integer } from '../../../../construction/index.ts'

import { isProduct, isZero } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Product): ExpressionNode {
	return node.factors.some(isZero) ? Integer.zero : node
}

export const simplifyZeroProducts = defineRule({
	name: 'simplifyZeroProducts',
	appliesTo: isProduct,
	transform,
})
