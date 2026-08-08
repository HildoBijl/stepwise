import { isPlusMinus, isSum } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type PlusMinus, type Sum, plusMinus, sum } from '../../../../construction'

function transform(node: PlusMinus): Sum | PlusMinus {
	return isSum(node.node) ? sum(...node.node.terms.map(plusMinus)) as Sum : node
}

export const expandPlusMinusSums = defineRule({
	appliesTo: isPlusMinus,
	transform,
})
