import { type Product, type Fraction, product, fraction } from '../../../../construction'

import { isProduct, isFraction } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Product): Product | Fraction {
	if (!node.factors.some(isFraction)) return node
	const numeratorFactors = node.factors.map(factor => isFraction(factor) ? factor.numerator : factor)
	const denominatorFactors = node.factors.flatMap(factor => isFraction(factor) ? [factor.denominator] : [])
	return fraction(product(...numeratorFactors), product(...denominatorFactors))
}

export const mergeFractionProducts = defineRule({
	name: 'mergeFractionProducts',
	appliesTo: isProduct,
	transform,
})
