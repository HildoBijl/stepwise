import { type Sum, type Fraction, Integer, fraction, product, sum } from '../../../../construction'

import { equalNodes, isFraction } from '../../../structural'

export function mergeFractionSums(node: Sum): Sum | Fraction {
	// Handle basic cases.
	if (!node.terms.some(isFraction)) return node
	if (node.terms.every(isFraction) && node.terms.every(term => equalNodes(term.denominator, (node.terms[0] as Fraction).denominator))) return fraction(sum(...node.terms.map(term => term.numerator)), node.terms[0].denominator)

	// Assemble the denominator and the numerator.
	const denominator = product(...node.terms.map(term => isFraction(term) ? term.denominator : undefined))
	const numerator = sum(...node.terms.map((term, index) => product(...node.terms.map((otherTerm, otherIndex) => {
		if (index === otherIndex) return isFraction(term) ? term.numerator : term
		return isFraction(otherTerm) ? otherTerm.denominator : undefined
	}))))
	return fraction(numerator, denominator)
}
