import { sum as arraySum } from '@step-wise/js-utils'

import { type ExpressionNode, type Sum, sum, product } from '../../../../construction/index.ts'

import { isSum, areNodesEqual, isOne } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'
import { type SimplificationContext } from '../types.ts'
import { getConstantAndVariablePart } from '../utils/index.ts'

function transform(node: Sum, context: SimplificationContext): ExpressionNode {
	// Group the terms into groups.
	const groups: { variablePart: ExpressionNode, constantParts: ExpressionNode[], original: ExpressionNode }[] = []
	for (const term of node.terms) {
		const { constantPart, variablePart } = getConstantAndVariablePart(term)
		const group = isOne(variablePart) ? undefined : groups.find(group => areNodesEqual(group.variablePart, variablePart)) // Don't group numeric terms.
		if (group) group.constantParts.push(constantPart)
		else groups.push({ variablePart, constantParts: [constantPart], original: term })
	}
	if (groups.length === node.terms.length) return node

	// For each group, set up the sum of the constant terms and simplify it. If this did not reduce the number of terms, don't simplify. This prevents infinite loops.
	const constantParts = groups.map(group => group.constantParts.length === 1 ? group.constantParts[0] : context.simplify(sum(...group.constantParts)))
	const termCountAfterExpansion = arraySum(constantParts.map(constantPart => isSum(constantPart) ? constantPart.terms.length : 1))
	if ([...context.simplificationRules].some(rule => rule.name === 'expandProductsOfSums') && termCountAfterExpansion >= node.terms.length) return node

	// Set up the final result.
	return sum(...groups.map((group, index) => group.constantParts.length === 1 ? group.original : product(constantParts[index], group.variablePart)))
}

export const combineLikeTerms = defineRule({
	name: 'combineLikeTerms',
	appliesTo: isSum,
	transform,
})
