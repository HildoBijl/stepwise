import { compareNumbers } from '@step-wise/utils'

import { Integer, Float } from '../../../../construction'

export function turnFloatsIntoIntegers(node: Float): Integer | Float {
	const rounded = Math.round(node.value)
	return compareNumbers(node.value, rounded) ? new Integer(rounded) : node
}
