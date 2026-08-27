import { gcd } from '@step-wise/math-tools'

import { type ExpressionNode, type Fraction, fraction } from '../../../../construction'

import { isFraction, isIntegerNode } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { getSumTerms, getLeadingNumber, divideLeadingNumberBy } from '../utils'

export function applyCombineNumbersInFractions(node: Fraction): ExpressionNode {
	const terms = [...getSumTerms(node.numerator), ...getSumTerms(node.denominator)]
	const leadingNumbers = terms.map(getLeadingNumber)
	if (!leadingNumbers.every(isIntegerNode)) return node
	const positiveDivisor = gcd(...leadingNumbers.map(node => node.value))
	const divisor = leadingNumbers.every(node => node.value < 0) ? -positiveDivisor : positiveDivisor
	if (divisor === 0 || divisor === 1) return node
	return fraction(divideLeadingNumberBy(node.numerator, divisor), divideLeadingNumberBy(node.denominator, divisor))
}

export const combineNumbersInFractions = defineRule({
	name: 'combineNumbersInFractions',
	appliesTo: isFraction,
	transform: applyCombineNumbersInFractions,
})
