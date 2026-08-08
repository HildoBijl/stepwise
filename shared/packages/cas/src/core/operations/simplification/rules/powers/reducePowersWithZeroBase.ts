import { isPower, isZero } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type Power, Integer } from '../../../../construction'

function transform(node: Power): Power | Integer {
	return isZero(node.base) && !isZero(node.exponent) ? Integer.zero : node
}

export const reducePowersWithZeroBase = defineRule({
	appliesTo: isPower,
	transform,
})
