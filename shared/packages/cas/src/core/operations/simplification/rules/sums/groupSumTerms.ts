import { type ExpressionNode, type Sum, sum, product } from '../../../../construction'

import { equalNodes, isOne } from '../../../structural'

import { getConstantAndVariablePart } from '../utils'

export function groupSumTerms(node: Sum): ExpressionNode {
	const groups: { variablePart: ExpressionNode, constantParts: ExpressionNode[], original: ExpressionNode }[] = []
	for (const term of node.terms) {
		const { constantPart, variablePart } = getConstantAndVariablePart(term)
		const group = isOne(variablePart) ? undefined : groups.find(group => equalNodes(group.variablePart, variablePart)) // Don't group numeric terms.
		if (group) group.constantParts.push(constantPart)
		else groups.push({ variablePart, constantParts: [constantPart], original: term })
	}
	if (groups.length === node.terms.length) return node
	return sum(...groups.map(group => group.constantParts.length === 1 ? group.original : product(sum(...group.constantParts), group.variablePart)))
}
