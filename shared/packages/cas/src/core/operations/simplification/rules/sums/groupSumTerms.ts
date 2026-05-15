import { sum as arraySum } from '@step-wise/utils'

import { type ExpressionNode, type Sum, sum, product } from '../../../../construction'

import { equalNodes, isOne, isSum } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { getConstantAndVariablePart } from '../utils'

export function groupSumTerms(node: Sum, context: SimplificationContext): ExpressionNode {
	// Group the terms into groups.
	const groups: { variablePart: ExpressionNode, constantParts: ExpressionNode[], original: ExpressionNode }[] = []
	for (const term of node.terms) {
		const { constantPart, variablePart } = getConstantAndVariablePart(term)
		const group = isOne(variablePart) ? undefined : groups.find(group => equalNodes(group.variablePart, variablePart)) // Don't group numeric terms.
		if (group) group.constantParts.push(constantPart)
		else groups.push({ variablePart, constantParts: [constantPart], original: term })
	}
	if (groups.length === node.terms.length) return node

	// For each group, set up the sum of the constant terms and simplify it. If this did not reduce the number of terms, don't simplify. This prevents infinite loops.
	const constantParts = groups.map(group => group.constantParts.length === 1 ? group.constantParts[0] : context.simplify(sum(...group.constantParts)))
	const termCountAfterExpansion = arraySum(constantParts.map(constantPart => isSum(constantPart) ? constantPart.terms.length : 1))
	if (context.simplificationOptions.has('expandProductsOfSums') && termCountAfterExpansion >= node.terms.length) return node

	// Set up the final result.
	return sum(...groups.map((group, index) => group.constantParts.length === 1 ? group.original : product(constantParts[index], group.variablePart)))
}
