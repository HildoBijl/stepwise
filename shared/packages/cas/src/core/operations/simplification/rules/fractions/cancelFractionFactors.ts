import { type ExpressionNode, type Fraction, Integer, recreateSignNode, sum, product, fraction } from '../../../../construction'

import { isOne, isSignNode, isSum, equalNodes, abs } from '../../../structural'

import { getProductFactors } from '../utils'

export function cancelFractionFactors(node: Fraction): ExpressionNode {
	// Try to find common factors in the numerator and denominator as a whole.
	const wholeCommonFactors = getExactCommonFactors(node.numerator, node.denominator)
	if (wholeCommonFactors.length > 0) return fraction(removeExactFactors(node.numerator, wholeCommonFactors), removeExactFactors(node.denominator, wholeCommonFactors))

	// Try to find commonalities between the numerator as a whole and the denominator's terms.
	if (isSum(node.denominator)) {
		const commonFactors = getExactCommonFactors(node.numerator, ...node.denominator.terms)
		if (commonFactors.length > 0) return fraction(removeExactFactors(node.numerator, commonFactors), removeExactFactors(node.denominator, commonFactors))
	}

	// Try to find commonalities between the denominator as a whole and the numerator's terms.
	if (isSum(node.numerator)) {
		const commonFactors = getExactCommonFactors(...node.numerator.terms, node.denominator)
		if (commonFactors.length > 0) return fraction(removeExactFactors(node.numerator, commonFactors), removeExactFactors(node.denominator, commonFactors))
	}

	// Try to find commonalities between the terms of both the numerator and the denominator.
	if (isSum(node.numerator) && isSum(node.denominator)) {
		const commonFactors = getExactCommonFactors(...node.numerator.terms, ...node.denominator.terms)
		if (commonFactors.length > 0) return fraction(removeExactFactors(node.numerator, commonFactors), removeExactFactors(node.denominator, commonFactors))
	}

	// Nothing found that can be simplified.
	return node
}

// Find all common factors of a set of nodes, requiring exact matches. (x^3 only matches x^3 and not x^2.)
function getExactCommonFactors(...nodes: ExpressionNode[]): readonly ExpressionNode[] {
	let exactCommonFactors = getProductFactors(abs(nodes[0])).filter(factor => !isOne(factor))
	for (const node of nodes.slice(1)) {
		const factors = getProductFactors(abs(node))
		exactCommonFactors = exactCommonFactors.filter(commonFactor => factors.some(factor => equalNodes(factor, commonFactor)))
	}
	return exactCommonFactors
}

// Remove multiple factors from a given expression.
export function removeExactFactors(node: ExpressionNode, factorsToRemove: readonly ExpressionNode[]): ExpressionNode {
	if (isSum(node)) {
		if (factorsToRemove.length === 1 && equalNodes(node, factorsToRemove[0])) return Integer.one
		return sum(...node.terms.map(term => removeExactFactors(term, factorsToRemove)))
	}
	if (isSignNode(node)) return recreateSignNode(node, removeExactFactors(node.node, factorsToRemove))
	let factors = getProductFactors(node)
	for (const factorToRemove of factorsToRemove) {
		const index = factors.findIndex(factor => equalNodes(factor, factorToRemove))
		if (index === -1) throw new Error('Invalid removeFactor call: cannot remove the factor from the given expression.')
		factors = factors.filter((_, factorIndex) => factorIndex !== index)
	}
	return product(...factors)
}
