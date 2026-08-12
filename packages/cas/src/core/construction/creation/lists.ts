import { removeUndefined } from '@step-wise/utils'

import { type ExpressionNode, Integer, Sum, Product } from '../nodes'

import { type ExpressionNodeInput, asExpressionNode } from './asExpressionNode'

// Expression lists. Undefineds are removed from the list.
export function sum(...terms: (ExpressionNodeInput | undefined)[]): ExpressionNode {
	const processedTerms = removeUndefined(terms)
	return processedTerms.length === 0 ? Integer.zero : processedTerms.length === 1 ? asExpressionNode(processedTerms[0]) : new Sum(processedTerms.map(asExpressionNode))
}
export function product(...factors: (ExpressionNodeInput | undefined)[]): ExpressionNode {
	const processedFactors = removeUndefined(factors)
	return processedFactors.length === 0 ? Integer.one : processedFactors.length === 1 ? asExpressionNode(processedFactors[0]) : new Product(processedFactors.map(asExpressionNode))
}
