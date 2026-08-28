import { type Power, Integer } from '../../../../construction/index.ts'

import { isPower, isZero, isNumeric, isSingular, tryToEvaluateNumericNode } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): Power | Integer {
	if (!isZero(node.base) || isZero(node.exponent)) return node
	const exponent = isSingular(node.exponent) ? tryToEvaluateNumericNode(node.exponent) : undefined
	if (isNumeric(node.exponent) && (exponent === undefined || !(exponent > 0))) return node
	return Integer.zero
}

export const simplifyZeroBasePowers = defineRule({
	name: 'simplifyZeroBasePowers',
	appliesTo: isPower,
	transform,
})
