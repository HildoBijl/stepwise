import { isPower, isZero } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

// reducePowersWithZeroExponent.ts
import { type Power, Integer } from '../../../../construction'

function transform(node: Power): Power | Integer {
	return isZero(node.exponent) && !isZero(node.base) ? Integer.one : node
}

export const reducePowersWithZeroExponent = defineRule({
	appliesTo: isPower,
	transform,
})
