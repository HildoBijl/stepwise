import { type ExpressionNode, type Sum, sum } from '../../../../construction'

import { isNegativeSignNode, equalNodes } from '../../../structural'

export function cancelSumTerms(node: Sum): ExpressionNode {
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
	return (isNegativeSignNode(a) && equalNodes(a.node, b)) || (isNegativeSignNode(b) && equalNodes(a, b.node))
}
