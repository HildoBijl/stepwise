import { isProduct, equalNodes } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Product, power, product, sum } from '../../../../construction'

import { getBaseAndExponent } from '../utils'

function transform(node: Product): ExpressionNode {
	const groups: { base: ExpressionNode, exponents: ExpressionNode[], original: ExpressionNode }[] = []
	for (const factor of node.factors) {
		const { base, exponent } = getBaseAndExponent(factor)
		const group = groups.find(group => equalNodes(group.base, base))
		if (group) group.exponents.push(exponent)
		else groups.push({ base, exponents: [exponent], original: factor })
	}
	if (groups.length === node.factors.length) return node
	return product(...groups.map(group => group.exponents.length === 1 ? group.original : power(group.base, sum(...group.exponents))))
}

export const mergeProductFactors = defineRule({
	appliesTo: isProduct,
	transform,
})
