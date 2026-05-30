import { type ExpressionNode, type Fraction, fraction, negative, sum } from '../../../../construction'

import { isMinus, isSum } from '../../../structural'

import { removeDoubleNegatives } from '../signs/removeDoubleNegatives'
import { mergeFractionMinuses } from './mergeFractionMinuses'

export function normalizeFractionMinuses(node: Fraction): ExpressionNode {
	const numerator = pullMinusOutOfSum(node.numerator)
	const denominator = pullMinusOutOfSum(node.denominator)
	return isMinus(numerator) || isMinus(denominator) ? mergeFractionMinuses(fraction(numerator, denominator)) : node
}

function pullMinusOutOfSum(node: ExpressionNode): ExpressionNode {
	return isSum(node) && isMinus(node.terms[0]) ? negative(sum(...node.terms.map(term => removeDoubleNegatives(negative(term))))) : node
}
