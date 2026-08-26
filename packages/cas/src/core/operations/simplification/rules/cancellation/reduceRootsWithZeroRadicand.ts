import { type ExpressionNode, type RootLike, Integer } from '../../../../construction'

import { isRootLike, isZero, isNumeric, isSingular, tryNumericNodeToNumber } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootLike): ExpressionNode {
	if (!isZero(node.radicand)) return node
	const degree = isSingular(node.degree) ? tryNumericNodeToNumber(node.degree) : undefined
	if (isNumeric(node.degree) && (degree === undefined || !(degree > 0))) return node
	return Integer.zero
}

export const reduceRootsWithZeroRadicand = defineRule({
	name: 'reduceRootsWithZeroRadicand',
	appliesTo: isRootLike,
	transform,
})
