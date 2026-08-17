import { gcd } from '@step-wise/math-tools'

import { type ExpressionNode, type Fraction, fraction } from '../../../../construction'

import { isFraction, isIntegerNode } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { getSumTerms, getLeadingNumber, divideLeadingNumberBy } from '../utils'

export function applyMergeFractionNumbers(node: Fraction): ExpressionNode {
	const terms = [...getSumTerms(node.numerator), ...getSumTerms(node.denominator)]
	const leadingNumbers = terms.map(getLeadingNumber)
	if (!leadingNumbers.every(isIntegerNode)) return node
	const divisor = gcd(...leadingNumbers.map(node => node.value))
	if (divisor === 0 || divisor === 1) return node
	return fraction(divideLeadingNumberBy(node.numerator, divisor), divideLeadingNumberBy(node.denominator, divisor))
}

export const mergeFractionNumbers = defineRule({
	name: 'mergeFractionNumbers',
	appliesTo: isFraction,
	transform: applyMergeFractionNumbers,
})
