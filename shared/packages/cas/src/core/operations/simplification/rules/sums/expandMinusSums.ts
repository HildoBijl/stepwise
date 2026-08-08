import { isMinus, isSum } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type Minus, type Sum, negative, sum } from '../../../../construction'

function transform(node: Minus): Sum | Minus {
	return isSum(node.node) ? sum(...node.node.terms.map(negative)) as Sum : node
}

export const expandMinusSums = defineRule({
	appliesTo: isMinus,
	transform,
})
