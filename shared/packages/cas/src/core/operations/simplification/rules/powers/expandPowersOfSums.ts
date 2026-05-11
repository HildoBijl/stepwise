import { repeatFromTo } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'

import { type ExpressionNode, type Power, power, product, sum } from '../../../../construction'

import { isIntegerNode, isSum } from '../../../structural'

export function expandPowersOfSums(node: Power): ExpressionNode {
	if (!isSum(node.base) || !isIntegerNode(node.exponent)) return node
	const n = node.exponent.value
	const firstTerm = node.base.terms[0]
	const otherTerms = sum(...node.base.terms.slice(1))
	return sum(...repeatFromTo(0, n, index => product(binomial(n, index), power(firstTerm, n - index), power(otherTerms, index))))
}
