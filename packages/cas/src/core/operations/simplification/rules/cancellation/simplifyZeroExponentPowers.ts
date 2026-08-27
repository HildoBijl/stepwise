import { type Power, Integer } from '../../../../construction'

import { isPower, isZero } from '../../../structural'

import { defineRule } from '../ruleDefinition'

// simplifyZeroExponentPowers.ts

function transform(node: Power): Power | Integer {
	return isZero(node.exponent) && !isZero(node.base) ? Integer.one : node
}

export const simplifyZeroExponentPowers = defineRule({
	name: 'simplifyZeroExponentPowers',
	appliesTo: isPower,
	transform,
})
