import { type ExpressionNode, type Sum, sum } from '../../../../construction'

import { isZero } from '../../../structural'

export function removeZeroesFromSums(node: Sum): ExpressionNode {
	const terms = node.terms.filter(term => !isZero(term))
	return terms.length === node.terms.length ? node : sum(...terms)
}
