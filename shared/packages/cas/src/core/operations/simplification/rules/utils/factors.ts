import { type ExpressionNode, sum, product } from '../../../../construction'

import { isOne, isSum, equalNodes } from '../../../structural'

import { getProductFactors } from './defaults'

// Remove a factor from a given expression.
export function removeFactor(node: ExpressionNode, factorToRemove: ExpressionNode): ExpressionNode {
	if (isSum(node)) return sum(...node.terms.map(term => removeFactor(term, factorToRemove)))
	const factors = getProductFactors(node)
	const index = factors.findIndex(factor => equalNodes(factor, factorToRemove))
	if (index === -1) throw new Error(`Invalid removeFactor call: cannot remove the factor from the given expression.`)
	return product(...factors.filter((_, factorIndex) => factorIndex !== index))
}

// Remove multiple factors from a given expression.
export function removeFactors(node: ExpressionNode, factorsToRemove: readonly ExpressionNode[]): ExpressionNode {
	return factorsToRemove.reduce((result, factor) => removeFactor(result, factor), node)
}

// Find all common factors of a set of nodes.
export function getCommonFactors(...nodes: ExpressionNode[]): readonly ExpressionNode[] {
	let commonFactors = getProductFactors(nodes[0]).filter(factor => !isOne(factor))
	for (const node of nodes.slice(1)) {
		const factors = getProductFactors(node)
		commonFactors = commonFactors.filter(commonFactor => factors.some(factor => equalNodes(factor, commonFactor, { allowOrderChanges: true })))
	}
	return commonFactors
}

// Find the greatest common factor of a set of nodes.
export function getGreatestCommonFactor(...nodes: ExpressionNode[]): ExpressionNode {
	return product(...getCommonFactors(...nodes))
}
