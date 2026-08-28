import { type ExpressionNode, type RootFunction, Integer } from '../../../../construction/index.ts'

import { isRootFunction, isZero, isNumeric, isSingular, tryToEvaluateNumericNode } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: RootFunction): ExpressionNode {
	if (!isZero(node.radicand)) return node
	const degree = isSingular(node.degree) ? tryToEvaluateNumericNode(node.degree) : undefined
	if (isNumeric(node.degree) && (degree === undefined || !(degree > 0))) return node
	return Integer.zero
}

export const simplifyZeroRadicandRoots = defineRule({
	name: 'simplifyZeroRadicandRoots',
	appliesTo: isRootFunction,
	transform,
})
