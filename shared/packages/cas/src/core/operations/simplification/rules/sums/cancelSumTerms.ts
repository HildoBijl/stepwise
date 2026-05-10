import { type ExpressionNode, Sum } from '../../../../construction'

import { isNegativeSignNode, equalNodes, defaultComparisonSettings } from '../../../structural'

export function cancelSumTerms(node: Sum): Sum {
	const skipped = node.terms.map(() => false)
	const terms = node.terms.filter((term, index) => {
		if (skipped[index]) return false
		const matchIndex = node.terms.findIndex((otherTerm, otherIndex) => index < otherIndex && !skipped[otherIndex] && isOppositeTerm(term, otherTerm))
		if (matchIndex === -1) return true
		skipped[index] = true
		skipped[matchIndex] = true
		return false
	})
	return terms.length === node.terms.length ? node : new Sum(terms)
}

function isOppositeTerm(a: ExpressionNode, b: ExpressionNode) {
	return (isNegativeSignNode(a) && equalNodes(a.node, b, defaultComparisonSettings)) || (isNegativeSignNode(b) && equalNodes(a, b.node, defaultComparisonSettings))
}
