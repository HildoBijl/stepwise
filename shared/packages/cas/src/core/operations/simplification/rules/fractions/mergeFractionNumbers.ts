import { gcd } from '@step-wise/math-tools'

import { type ExpressionNode, type Fraction, fraction } from '../../../../construction'

import { isIntegerNode } from '../../../structural'

import { getSumTerms, getLeadingNumber, divideLeadingNumberBy } from '../utils'

export function mergeFractionNumbers(node: Fraction): ExpressionNode {
	const terms = [...getSumTerms(node.numerator), ...getSumTerms(node.denominator)]
	const leadingNumbers = terms.map(getLeadingNumber)
	if (!leadingNumbers.every(isIntegerNode)) return node
	const divisor = gcd(...leadingNumbers.map(node => node.value))
	if (divisor === 1) return node
	return fraction(divideLeadingNumberBy(node.numerator, divisor), divideLeadingNumberBy(node.denominator, divisor))
}
