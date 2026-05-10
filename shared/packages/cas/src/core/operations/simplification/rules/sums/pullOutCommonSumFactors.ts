import { type ExpressionNode , Sum, Product } from '../../../../construction'

import { isProduct, equalNodes, defaultComparisonSettings } from '../../../structural'

export function pullOutCommonSumFactors(node: Sum): Sum | Product {
	if (node.terms.length <= 1) return node

	// Find common factors to pull out.
	let commonFactors = getProductFactors(node.terms[0])
	for (const term of node.terms.slice(1)) {
		const factors = getProductFactors(term)
		commonFactors = commonFactors.filter(commonFactor => factors.some(factor => equalNodes(factor, commonFactor, defaultComparisonSettings)))
	}
	if (commonFactors.length === 0) return node

	// Pull out the common factors.
	const commonFactor = new Product(commonFactors)
	const terms = node.terms.map(term => commonFactors.reduce((result, factor) => removeFactor(result, factor), term))
	return new Product([commonFactor, new Sum(terms)])
}

// Get all factors within the expression as a list.
function getProductFactors(node: ExpressionNode): readonly ExpressionNode[] {
	return isProduct(node) ? node.factors : [node]
}

// Remove a factor from a given expression.
function removeFactor(node: ExpressionNode, factorToRemove: ExpressionNode): Product {
	const factors = getProductFactors(node)
	const index = factors.findIndex(factor => equalNodes(factor, factorToRemove, defaultComparisonSettings))
	if (index === -1) throw new Error(`Invalid removeFactor call: cannot remove the factor from the given expression.`)
	return new Product(factors.filter((_, factorIndex) => factorIndex !== index))
}
