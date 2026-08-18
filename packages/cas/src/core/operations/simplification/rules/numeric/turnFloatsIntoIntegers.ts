import { approximatelyEqual } from '@step-wise/js-utils'

import { Integer, Float } from '../../../../construction'

import { isFloatNode } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Float): Integer | Float {
	const rounded = Math.round(node.value)
	return approximatelyEqual(node.value, rounded) ? new Integer(rounded) : node
}

export const turnFloatsIntoIntegers = defineRule({
	name: 'turnFloatsIntoIntegers',
	appliesTo: isFloatNode,
	transform,
})
