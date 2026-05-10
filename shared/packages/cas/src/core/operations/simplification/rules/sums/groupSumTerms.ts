import { splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Sum, type Product, Integer, sum, product } from '../../../../construction'

import { isSignNode, isProduct, isNumeric, equalNodes, isOne } from '../../../structural'

export function groupSumTerms(node: Sum): Sum | Product {
	const skipped = node.terms.map(() => false)
	const splitTerms = node.terms.map(getConstantAndVariablePart)
	const newTerms: ExpressionNode[] = []
	splitTerms.forEach((splitTerm, index) => {
		if (skipped[index]) return // Ignore elements already incorporated.
		if (isOne(splitTerm.variablePart)) return newTerms.push(node.terms[index]) // Don't group numeric terms.
		const sumParts: ExpressionNode[] = [splitTerm.constantPart]
		splitTerms.forEach((otherSplitTerm, otherIndex) => {
			if (index < otherIndex && !skipped[otherIndex] && equalNodes(splitTerm.variablePart, otherSplitTerm.variablePart, { allowOrderChanges: true })) {
				sumParts.push(otherSplitTerm.constantPart)
				skipped[otherIndex] = true
			}
		})
		if (sumParts.length === 1) newTerms.push(node.terms[index])
		else newTerms.push(product(sum(...sumParts), splitTerm.variablePart))
	})
	if (newTerms.length === node.terms.length) return node
	return sum(...newTerms) as Sum | Product
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
