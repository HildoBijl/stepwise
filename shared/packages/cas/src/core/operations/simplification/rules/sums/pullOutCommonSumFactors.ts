import { type ExpressionNode, type Sum, product, sum } from '../../../../construction'

import { getCommonFactors, removeFactors } from '../utils'

export function pullOutCommonSumFactors(node: Sum): ExpressionNode {
	const commonFactors = getCommonFactors(...node.terms)
	if (commonFactors.length === 0) return node
	return product(...commonFactors, sum(...node.terms.map(term => removeFactors(term, commonFactors))))
}
