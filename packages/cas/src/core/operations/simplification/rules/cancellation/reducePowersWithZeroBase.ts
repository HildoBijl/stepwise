import { type Power, Integer } from '../../../../construction'

import { isPower, isZero, isNumeric, isSingular, numericNodeToNumber } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Power): Power | Integer {
	if (!isZero(node.base) || isZero(node.exponent)) return node
	if (isNumeric(node.exponent) && (!isSingular(node.exponent) || !(numericNodeToNumber(node.exponent) > 0))) return node
	return Integer.zero
}

export const reducePowersWithZeroBase = defineRule({
	name: 'reducePowersWithZeroBase',
	appliesTo: isPower,
	transform,
})
