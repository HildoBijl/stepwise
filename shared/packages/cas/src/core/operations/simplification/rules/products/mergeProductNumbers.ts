import { first, product as arrayProduct, splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Product, integer, float, product } from '../../../../construction'

import { isNumberNode, isFloatNode } from '../../../structural'

export function mergeProductNumbers(node: Product): ExpressionNode {
	const [numberFactors, nonNumberFactors] = splitArray(node.factors, node => isNumberNode(node))
	if (numberFactors.length === 0 || (numberFactors.length === 1 && isNumberNode(first(node.factors)))) return node
	const value = arrayProduct(numberFactors.map(node => node.value))
	const constant = numberFactors.some(isFloatNode) ? float(value) : integer(value)
	return product(constant, ...nonNumberFactors)
}
