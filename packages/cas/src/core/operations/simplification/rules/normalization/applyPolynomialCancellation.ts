
import { type ExpressionNode, type Fraction, fraction, product } from '../../../../construction'

import { isFraction, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { type SimplificationContext, type SimplificationRules } from '../types'
import { getPolynomialGCD, getProductFactors } from '../utils'

import { normalizationRequirementRules } from './normalizationRequirements'

let normalizationRequirementRuleSet: SimplificationRules | undefined

function transform(node: Fraction, context: SimplificationContext): ExpressionNode {
	let numeratorFactors = getProductFactors(node.numerator)
	let denominatorFactors = getProductFactors(node.denominator)
	let changed = false
	for (let numeratorIndex = 0; numeratorIndex < numeratorFactors.length; numeratorIndex++) {
		for (let denominatorIndex = 0; denominatorIndex < denominatorFactors.length; denominatorIndex++) {
			const result = getPolynomialGCD(numeratorFactors[numeratorIndex], denominatorFactors[denominatorIndex], node => context.simplify(node, normalizationRequirementRuleSet ??= new Set(normalizationRequirementRules)))
			if (isOne(result.gcd)) continue
			numeratorFactors = numeratorFactors.toSpliced(numeratorIndex, 1, result.factors[0])
			denominatorFactors = denominatorFactors.toSpliced(denominatorIndex, 1, result.factors[1])
			changed = true
		}
	}
	return changed ? fraction(product(...numeratorFactors), product(...denominatorFactors)) : node
}

export const applyPolynomialCancellation = defineRule({
	name: 'applyPolynomialCancellation',
	appliesTo: isFraction,
	transform,
	requires: normalizationRequirementRules,
	after: normalizationRequirementRules,
})
