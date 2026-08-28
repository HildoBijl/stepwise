import { type Fraction, sum, fraction } from '../../../../construction/index.ts'

import { isSum } from '../../../structural/index.ts'

import { getCommonFactors, removeFactors } from './factors.ts'

export function applyCombineFractionFactors(node: Fraction): Fraction {
	const wholeCommonFactors = getCommonFactors(node.numerator, node.denominator)
	if (wholeCommonFactors.length > 0) return fraction(removeFactors(node.numerator, wholeCommonFactors), removeFactors(node.denominator, wholeCommonFactors))

	if (isSum(node.denominator)) {
		const commonFactors = getCommonFactors(node.numerator, ...node.denominator.terms)
		if (commonFactors.length > 0) return fraction(removeFactors(node.numerator, commonFactors), sum(...node.denominator.terms.map(term => removeFactors(term, commonFactors))))
	}

	if (isSum(node.numerator)) {
		const commonFactors = getCommonFactors(...node.numerator.terms, node.denominator)
		if (commonFactors.length > 0) return fraction(sum(...node.numerator.terms.map(term => removeFactors(term, commonFactors))), removeFactors(node.denominator, commonFactors))
	}

	if (isSum(node.numerator) && isSum(node.denominator)) {
		const commonFactors = getCommonFactors(...node.numerator.terms, ...node.denominator.terms)
		if (commonFactors.length > 0) return fraction(sum(...node.numerator.terms.map(term => removeFactors(term, commonFactors))), sum(...node.denominator.terms.map(term => removeFactors(term, commonFactors))))
	}

	return node
}
