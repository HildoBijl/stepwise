import { type Power, Integer } from '../../../../construction'

import { isPower, isZero } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Power): Power | Integer {
	return isZero(node.base) && !isZero(node.exponent) ? Integer.zero : node
}

export const reducePowersWithZeroBase = defineRule({
	name: 'reducePowersWithZeroBase',
	appliesTo: isPower,
	transform,
})
