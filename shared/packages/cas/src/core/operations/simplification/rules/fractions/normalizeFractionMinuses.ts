import { type ExpressionNode, type Fraction, fraction, negative, sum } from '../../../../construction'

import { isFraction, isMinus, isSum } from '../../../structural'

import { defineRule } from '../utils'
import { applyRemoveDoubleNegatives } from '../signs/removeDoubleNegatives'

import { applyMergeFractionMinuses } from './mergeFractionMinuses'

function transform(node: Fraction): ExpressionNode {
	const numerator = pullMinusOutOfSum(node.numerator)
	const denominator = pullMinusOutOfSum(node.denominator)
	return isMinus(numerator) || isMinus(denominator) ? applyMergeFractionMinuses(fraction(numerator, denominator)) : node
}

function pullMinusOutOfSum(node: ExpressionNode): ExpressionNode {
	return isSum(node) && isMinus(node.terms[0]) ? negative(sum(...node.terms.map(term => applyRemoveDoubleNegatives(negative(term))))) : node
}

export const normalizeFractionMinuses = defineRule({
	appliesTo: isFraction,
	transform,
	requires: ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives'],
})
