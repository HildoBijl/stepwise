import { type Minus, type Sum, negative, sum } from '../../../../construction/index.ts'

import { isMinus, isSum } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Minus): Sum | Minus {
	return isSum(node.node) ? sum(...node.node.terms.map(negative)) as Sum : node
}

export const expandMinusSums = defineRule({
	name: 'expandMinusSums',
	appliesTo: isMinus,
	transform,
})
