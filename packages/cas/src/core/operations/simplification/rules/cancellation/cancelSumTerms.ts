import { type ExpressionNode, type Sum, sum } from '../../../../construction/index.ts'

import { isSum, isMinus, areNodesEqual } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Sum): ExpressionNode {
	const skipped = node.terms.map(() => false)
	const terms = node.terms.filter((term, index) => {
		if (skipped[index]) return false
		const matchIndex = node.terms.findIndex((otherTerm, otherIndex) => index < otherIndex && !skipped[otherIndex] && isOppositeTerm(term, otherTerm))
		if (matchIndex === -1) return true
		skipped[index] = true
		skipped[matchIndex] = true
		return false
	})
	return terms.length === node.terms.length ? node : sum(...terms)
}

function isOppositeTerm(a: ExpressionNode, b: ExpressionNode) {
	return (isMinus(a) && areNodesEqual(a.node, b)) || (isMinus(b) && areNodesEqual(a, b.node))
}

export const cancelSumTerms = defineRule({
	name: 'cancelSumTerms',
	appliesTo: isSum,
	transform,
})
