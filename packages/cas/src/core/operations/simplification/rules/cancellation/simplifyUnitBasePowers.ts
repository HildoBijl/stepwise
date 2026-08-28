import { type Power, Integer } from '../../../../construction/index.ts'

import { isPower, isOne } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): Power | Integer {
	return isOne(node.base) ? Integer.one : node
}

export const simplifyUnitBasePowers = defineRule({
	name: 'simplifyUnitBasePowers',
	appliesTo: isPower,
	transform,
})
