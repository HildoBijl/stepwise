import { type Power, Integer } from '../../../../construction'

import { isPower, isOne } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Power): Power | Integer {
	return isOne(node.base) ? Integer.one : node
}

export const reducePowersWithOneBase = defineRule({
	appliesTo: isPower,
	transform,
})
