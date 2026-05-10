import { type Product, type Fraction, product, fraction } from '../../../../construction'

import { isFraction } from '../../../structural'

export function mergeFractionProducts(node: Product): Product | Fraction {
	if (!node.factors.some(isFraction)) return node
	const numeratorFactors = node.factors.map(factor => isFraction(factor) ? factor.numerator : factor)
	const denominatorFactors = node.factors.flatMap(factor => isFraction(factor) ? [factor.denominator] : [])
	return fraction(product(...numeratorFactors), product(...denominatorFactors))
}
