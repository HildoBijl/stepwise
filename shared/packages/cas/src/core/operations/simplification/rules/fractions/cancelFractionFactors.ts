import { type ExpressionNode, type Fraction, sum, product, fraction } from '../../../../construction'

import { isOne, isSum, equalNodes } from '../../../structural'

import { getSumTerms, getProductFactors } from '../utils'

export function cancelFractionFactors(node: Fraction): ExpressionNode {
	const commonFactors = getExactCommonFactors(...getSumTerms(node.numerator), ...getSumTerms(node.denominator))
	return commonFactors.length === 0 ? node : fraction(removeExactFactors(node.numerator, commonFactors), removeExactFactors(node.denominator, commonFactors))
}

// Find all common factors of a set of nodes, requiring exact matches. (x^3 only matches x^3 and not x^2.)
function getExactCommonFactors(...nodes: ExpressionNode[]): readonly ExpressionNode[] {
	let exactCommonFactors = getProductFactors(nodes[0]).filter(factor => !isOne(factor))
	for (const node of nodes.slice(1)) {
		const factors = getProductFactors(node)
		exactCommonFactors = exactCommonFactors.filter(commonFactor => factors.some(factor => equalNodes(factor, commonFactor)))
	}
	return exactCommonFactors
}

// Remove multiple factors from a given expression.
export function removeExactFactors(node: ExpressionNode, factorsToRemove: readonly ExpressionNode[]): ExpressionNode {
	if (isSum(node)) return sum(...node.terms.map(term => removeExactFactors(term, factorsToRemove)))
	let factors = getProductFactors(node)
	for (const factorToRemove of factorsToRemove) {
		const index = factors.findIndex(factor => equalNodes(factor, factorToRemove))
		if (index === -1) throw new Error('Invalid removeFactor call: cannot remove the factor from the given expression.')
		factors = factors.filter((_, factorIndex) => factorIndex !== index)
	}
	return product(...factors)
}
