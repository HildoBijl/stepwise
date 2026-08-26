import { type LogLike } from '../../../../construction'

import { isNumeric, isSingular, numericNodeToNumber } from '../../../structural'

// Symbolic bases retain the usual logarithm domain assumption. Explicit numeric bases must be valid.
export function hasValidLogarithmBase(node: LogLike): boolean {
	if (!isNumeric(node.base)) return true
	if (!isSingular(node.base)) return false
	const base = numericNodeToNumber(node.base)
	return base > 0 && base !== 1
}
