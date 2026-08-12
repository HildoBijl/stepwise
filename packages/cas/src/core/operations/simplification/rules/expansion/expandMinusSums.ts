import { type Minus, type Sum, negative, sum } from '../../../../construction'

import { isMinus, isSum } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Minus): Sum | Minus {
	return isSum(node.node) ? sum(...node.node.terms.map(negative)) as Sum : node
}

export const expandMinusSums = defineRule({
	name: 'expandMinusSums',
	appliesTo: isMinus,
	transform,
})
