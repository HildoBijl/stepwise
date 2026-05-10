import { type ExpressionNode, type Fraction, fraction, negative, sum } from '../../../../construction'

import { isNegativeSign, isSum } from '../../../structural'

import { mergeFractionMinuses } from './mergeFractionMinuses'

export function normalizeFractionMinuses(node: Fraction): ExpressionNode {
	const numerator = pullMinusFromPart(node.numerator)
	const denominator = pullMinusFromPart(node.denominator)
	if (!isNegativeSign(numerator) && !isNegativeSign(denominator)) return node
	return mergeFractionMinuses(fraction(numerator, denominator))
}

function pullMinusFromPart(node: ExpressionNode): ExpressionNode {
	if (!isSum(node)) return node
	const firstTerm = node.terms[0]
	if (!isNegativeSign(firstTerm)) return node
	return negative(sum(...node.terms.map(negative)))
}
