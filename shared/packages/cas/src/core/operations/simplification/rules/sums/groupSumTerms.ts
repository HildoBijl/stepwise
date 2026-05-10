import { splitArray } from '@step-wise/utils'

import { type ExpressionNode, Integer, Sum, Product } from '../../../../construction'

import { isSignNode, isProduct, isNumeric, equalNodes, defaultComparisonSettings } from '../../../structural'

export function groupSumTerms(node: Sum): Sum {
	const skipped = node.terms.map(() => false)
	const splitTerms = node.terms.map(getConstantAndVariablePart)
	const newTerms: ExpressionNode[] = []
	splitTerms.forEach((splitTerm, index) => {
		if (skipped[index]) return
		const sumParts: ExpressionNode[] = [splitTerm.constantPart]
		splitTerms.forEach((otherSplitTerm, otherIndex) => {
			if (skipped[otherIndex] || index >= otherIndex || !equalNodes(splitTerm.variablePart, otherSplitTerm.variablePart, defaultComparisonSettings)) return
			sumParts.push(otherSplitTerm.constantPart)
			skipped[otherIndex] = true
		})
		if (sumParts.length === 1) newTerms.push(node.terms[index])
		else newTerms.push(new Product([new Sum(sumParts), splitTerm.variablePart]))
	})
	if (newTerms.length === node.terms.length) return node
	return new Sum(newTerms)
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
	return {
		constantPart: constantFactors.length === 0 ? Integer.one : new Product(constantFactors),
		variablePart: variableFactors.length === 0 ? Integer.one : new Product(variableFactors),
	}
}
