import { product as arrayProduct, splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Product, integer, float, product } from '../../../../construction'

import { isConstantNode, isFloatNode } from '../../../structural'

export function mergeProductNumbers(node: Product): ExpressionNode {
	const [constants, nonConstants] = splitArray(node.factors, isConstantNode)
	if (constants.length < 2) return node
	const value = arrayProduct(constants.map(node => node.value))
	const constant = constants.some(isFloatNode) ? float(value) : integer(value)
	return product(constant, ...nonConstants)
}
