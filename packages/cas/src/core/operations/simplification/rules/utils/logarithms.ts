import { type LogarithmFunction } from '../../../../construction'

import { isNumeric, isSingular, tryToEvaluateNumericNode } from '../../../structural'

// Symbolic bases retain the usual logarithm domain assumption. Explicit numeric bases must be valid.
export function hasValidLogarithmBase(node: LogarithmFunction): boolean {
	if (!isNumeric(node.base)) return true
	if (!isSingular(node.base)) return false
	const base = tryToEvaluateNumericNode(node.base)
	return base !== undefined && base > 0 && base !== 1
}
