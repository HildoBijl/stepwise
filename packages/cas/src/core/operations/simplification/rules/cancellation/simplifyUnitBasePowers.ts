import { type Power, Integer } from '../../../../construction'

import { isPower, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Power): Power | Integer {
	return isOne(node.base) ? Integer.one : node
}

export const simplifyUnitBasePowers = defineRule({
	name: 'simplifyUnitBasePowers',
	appliesTo: isPower,
	transform,
})
