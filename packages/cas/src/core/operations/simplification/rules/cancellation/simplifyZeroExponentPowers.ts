import { type Power, Integer } from '../../../../construction/index.ts'

import { isPower, isZero } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

// simplifyZeroExponentPowers.ts

function transform(node: Power): Power | Integer {
	return isZero(node.exponent) && !isZero(node.base) ? Integer.one : node
}

export const simplifyZeroExponentPowers = defineRule({
	name: 'simplifyZeroExponentPowers',
	appliesTo: isPower,
	transform,
})
