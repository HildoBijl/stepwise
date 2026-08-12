import { type PlusMinus, type Sum, plusMinus, sum } from '../../../../construction'

import { isPlusMinus, isSum } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: PlusMinus): Sum | PlusMinus {
	return isSum(node.node) ? sum(...node.node.terms.map(plusMinus)) as Sum : node
}

export const expandPlusMinusSums = defineRule({
	name: 'expandPlusMinusSums',
	appliesTo: isPlusMinus,
	transform,
})
