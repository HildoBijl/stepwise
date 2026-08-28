import { type ExpressionNode, type Fraction } from '../../../../construction/index.ts'

import { isFraction, isZero } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Fraction): ExpressionNode {
	return isZero(node.numerator) && !isZero(node.denominator) ? node.numerator : node
}

export const simplifyZeroNumeratorFractions = defineRule({
	name: 'simplifyZeroNumeratorFractions',
	appliesTo: isFraction,
	transform,
})
