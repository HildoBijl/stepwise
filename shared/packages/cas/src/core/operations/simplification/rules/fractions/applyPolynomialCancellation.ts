import { arraySplice } from '@step-wise/utils'

import { type ExpressionNode, type Fraction, fraction, product } from '../../../../construction'

import { isFraction, isOne } from '../../../structural'

import { type SimplificationContext, normalizationRequirements } from '../../simplificationOptions'

import { defineRule, getPolynomialGCD, getProductFactors } from '../utils'

function transform(node: Fraction, context: SimplificationContext): ExpressionNode {
	let numeratorFactors = getProductFactors(node.numerator)
	let denominatorFactors = getProductFactors(node.denominator)
	let changed = false
	for (let numeratorIndex = 0; numeratorIndex < numeratorFactors.length; numeratorIndex++) {
		for (let denominatorIndex = 0; denominatorIndex < denominatorFactors.length; denominatorIndex++) {
			const result = getPolynomialGCD(numeratorFactors[numeratorIndex], denominatorFactors[denominatorIndex], context.simplify)
			if (isOne(result.gcd)) continue
			numeratorFactors = arraySplice(numeratorFactors, numeratorIndex, 1, result.factors[0])
			denominatorFactors = arraySplice(denominatorFactors, denominatorIndex, 1, result.factors[1])
			changed = true
		}
	}
	return changed ? fraction(product(...numeratorFactors), product(...denominatorFactors)) : node
}

export const applyPolynomialCancellation = defineRule({
	appliesTo: isFraction,
	transform,
	requires: [...normalizationRequirements],
})
