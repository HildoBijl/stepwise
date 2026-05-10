import { type ExpressionNode, type Sum, type Product, sum, product } from '../../../../construction'

import { isOne, isProduct, equalNodes } from '../../../structural'

export function pullOutCommonSumFactors(node: Sum): Sum | Product {
	// Find common factors to pull out.
	let commonFactors = getProductFactors(node.terms[0])
	for (const term of node.terms.slice(1)) {
		const factors = getProductFactors(term)
		commonFactors = commonFactors.filter(commonFactor => factors.some(factor => equalNodes(factor, commonFactor)))
	}
	if (commonFactors.length === 0) return node

	// Pull out the common factors.
	const commonFactor = product(...commonFactors)
	const terms = node.terms.map(term => commonFactors.reduce((result, factor) => removeFactor(result, factor), term))
	return product(commonFactor, sum(...terms)) as Product
}

// Get all none-one factors within the expression as a list.
function getProductFactors(node: ExpressionNode): readonly ExpressionNode[] {
	return (isProduct(node) ? node.factors : [node]).filter(factor => !isOne(factor))
}

// Remove a factor from a given expression.
function removeFactor(node: ExpressionNode, factorToRemove: ExpressionNode): ExpressionNode {
	const factors = getProductFactors(node)
	const index = factors.findIndex(factor => equalNodes(factor, factorToRemove))
	if (index === -1) throw new Error(`Invalid removeFactor call: cannot remove the factor from the given expression.`)
	return product(...factors.filter((_, factorIndex) => factorIndex !== index))
}
