import { type ExpressionNode, type Fraction, negative, fraction } from '../../../../construction'

import { isFraction, isMinus } from '../../../structural'

import { defineRule } from '../utils'

export function applyMergeFractionMinuses(node: Fraction): ExpressionNode {
	const numeratorIsNegative = isMinus(node.numerator)
	const denominatorIsNegative = isMinus(node.denominator)
	if (!numeratorIsNegative && !denominatorIsNegative) return node

	const numerator = numeratorIsNegative ? node.numerator.node : node.numerator
	const denominator = denominatorIsNegative ? node.denominator.node : node.denominator
	const result = fraction(numerator, denominator)
	return numeratorIsNegative === denominatorIsNegative ? result : negative(result)
}

export const mergeFractionMinuses = defineRule({
	appliesTo: isFraction,
	transform: applyMergeFractionMinuses,
})
