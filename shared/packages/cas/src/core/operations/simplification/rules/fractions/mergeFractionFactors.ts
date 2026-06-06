import { type Fraction, sum, fraction } from '../../../../construction'

import { isSum } from '../../../structural'

import { getCommonFactors, removeFactors } from '../utils'

export function mergeFractionFactors(node: Fraction): Fraction {
	// Try to find common factors in the numerator and denominator as a whole.
	const wholeCommonFactors = getCommonFactors(node.numerator, node.denominator)
	if (wholeCommonFactors.length > 0) return fraction(removeFactors(node.numerator, wholeCommonFactors), removeFactors(node.denominator, wholeCommonFactors))

	// Try to find commonalities between the numerator as a whole and the denominator's terms.
	if (isSum(node.denominator)) {
		const commonFactors = getCommonFactors(node.numerator, ...node.denominator.terms)
		if (commonFactors.length > 0) return fraction(removeFactors(node.numerator, commonFactors), sum(...node.denominator.terms.map(term => removeFactors(term, commonFactors))))
	}

	// Try to find commonalities between the denominator as a whole and the numerator's terms.
	if (isSum(node.numerator)) {
		const commonFactors = getCommonFactors(...node.numerator.terms, node.denominator)
		if (commonFactors.length > 0) return fraction(sum(...node.numerator.terms.map(term => removeFactors(term, commonFactors))), removeFactors(node.denominator, commonFactors))
	}

	// Try to find commonalities between the terms of both the numerator and the denominator.
	if (isSum(node.numerator) && isSum(node.denominator)) {
		const commonFactors = getCommonFactors(...node.numerator.terms, ...node.denominator.terms)
		if (commonFactors.length > 0) return fraction(sum(...node.numerator.terms.map(term => removeFactors(term, commonFactors))), sum(...node.denominator.terms.map(term => removeFactors(term, commonFactors))))
	}

	// Nothing found that can be simplified.
	return node
}
