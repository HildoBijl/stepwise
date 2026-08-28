import { type PlusMinus, type Sum, plusMinus, sum } from '../../../../construction/index.ts'

import { isPlusMinus, isSum } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: PlusMinus): Sum | PlusMinus {
	return isSum(node.node) ? sum(...node.node.terms.map(plusMinus)) as Sum : node
}

export const expandPlusMinusSums = defineRule({
	name: 'expandPlusMinusSums',
	appliesTo: isPlusMinus,
	transform,
})
