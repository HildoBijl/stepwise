import { type Product, type Fraction, product, fraction } from '../../../../construction/index.ts'

import { isProduct, isFraction } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Product): Product | Fraction {
	if (!node.factors.some(isFraction)) return node
	const numeratorFactors = node.factors.map(factor => isFraction(factor) ? factor.numerator : factor)
	const denominatorFactors = node.factors.flatMap(factor => isFraction(factor) ? [factor.denominator] : [])
	return fraction(product(...numeratorFactors), product(...denominatorFactors))
}

export const combineProductFractions = defineRule({
	name: 'combineProductFractions',
	appliesTo: isProduct,
	transform,
})
