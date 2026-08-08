import { isPower, isOne } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type Power, Integer } from '../../../../construction'

function transform(node: Power): Power | Integer {
	return isOne(node.base) ? Integer.one : node
}

export const reducePowersWithOneBase = defineRule({
	appliesTo: isPower,
	transform,
})
