import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isRootLike, isZero, isNumeric, isSingular, numericNodeToNumber } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootLike): ExpressionNode {
	if (!isZero(node.radicand)) return node
	if (isNumeric(node.degree) && (!isSingular(node.degree) || !(numericNodeToNumber(node.degree) > 0))) return node
	return Integer.zero
}

export const reduceRootsWithZeroRadicand = defineRule({
	name: 'reduceRootsWithZeroRadicand',
	appliesTo: isRootLike,
	transform,
})
