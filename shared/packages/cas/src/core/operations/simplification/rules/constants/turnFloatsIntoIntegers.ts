import { isFloatNode } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { compareNumbers } from '@step-wise/utils'

import { Integer, Float } from '../../../../construction'

function transform(node: Float): Integer | Float {
	const rounded = Math.round(node.value)
	return compareNumbers(node.value, rounded) ? new Integer(rounded) : node
}

export const turnFloatsIntoIntegers = defineRule({
	appliesTo: isFloatNode,
	transform,
})
