import { approximatelyEqual } from '@step-wise/js-utils'

import { Integer, Float } from '../../../../construction/index.ts'

import { isFloatNode } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Float): Integer | Float {
	const rounded = Math.round(node.value)
	return approximatelyEqual(node.value, rounded) ? new Integer(rounded) : node
}

export const convertIntegerFloatsToIntegers = defineRule({
	name: 'convertIntegerFloatsToIntegers',
	appliesTo: isFloatNode,
	transform,
})
