import { type ExpressionNode, type Sum, type Fraction, negative, sum, product, fraction } from '../../../../construction'

import { equalNodes, isMinus, isFraction } from '../../../structural'

export function mergeFractionSums(node: Sum): Sum | Fraction {
	// Handle basic cases.
	if (!(node.terms.some(isFraction) || node.terms.some(node => isMinus(node) && isFraction(node.node)))) return node
	if (node.terms.every(isFraction) && node.terms.every(term => equalNodes(term.denominator, (node.terms[0] as Fraction).denominator))) return fraction(sum(...node.terms.map(term => term.numerator)), node.terms[0].denominator)

	// Assemble the denominator and the numerator.
	const getDenominator = (node: ExpressionNode): ExpressionNode | undefined => isFraction(node) ? node.denominator : isMinus(node) ? getDenominator(node.node) : undefined
	const getNumerator = (node: ExpressionNode): ExpressionNode => isFraction(node) ? node.numerator : isMinus(node) ? negative(getNumerator(node.node)) : node
	const denominator = product(...node.terms.map(getDenominator))
	const numerator = sum(...node.terms.map((term, index) => product(...node.terms.map((otherTerm, otherIndex) => (index === otherIndex ? getNumerator(term) : getDenominator(otherTerm))))))
	return fraction(numerator, denominator)
}
