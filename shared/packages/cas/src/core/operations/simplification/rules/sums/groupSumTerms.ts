import { splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Sum, Integer, sum, product } from '../../../../construction'

import { isSignNode, isProduct, isNumeric, equalNodes, isOne } from '../../../structural'

export function groupSumTerms(node: Sum): ExpressionNode {
	const groups: { variablePart: ExpressionNode, constantParts: ExpressionNode[], original: ExpressionNode }[] = []
	for (const term of node.terms) {
		const { constantPart, variablePart } = getConstantAndVariablePart(term)
		const group = isOne(variablePart) ? undefined : groups.find(group => equalNodes(group.variablePart, variablePart, { allowOrderChanges: true })) // Don't group numeric terms.
		if (group) group.constantParts.push(constantPart)
		else groups.push({ variablePart, constantParts: [constantPart], original: term })
	}
	if (groups.length === node.terms.length) return node
	return sum(...groups.map(group => group.constantParts.length === 1 ? group.original : product(sum(...group.constantParts), group.variablePart)))
}

// Split an expression (often a product) into two parts: a numeric part and a part that does have variables.
function getConstantAndVariablePart(node: ExpressionNode): { constantPart: ExpressionNode, variablePart: ExpressionNode } {
	// Handle default cases.
	if (isNumeric(node)) return { constantPart: node, variablePart: Integer.one }
	if (isSignNode(node)) {
		const { constantPart, variablePart } = getConstantAndVariablePart(node.node)
		return { constantPart: node.recreateWith(constantPart), variablePart }
	}
	if (!isProduct(node)) return { constantPart: Integer.one, variablePart: node }

	// There's a product. Split factors.
	const [constantFactors, variableFactors] = splitArray(node.factors, isNumeric)
	return { constantPart: product(...constantFactors), variablePart: product(...variableFactors) }
}
