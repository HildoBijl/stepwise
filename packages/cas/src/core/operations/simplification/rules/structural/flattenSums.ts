import { Sum } from '../../../../construction/index.ts'

import { isSum } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Sum): Sum {
	const terms = node.terms.flatMap(term => isSum(term) ? term.terms : [term])
	return terms.length === node.terms.length ? node : new Sum(terms)
}

export const flattenSums = defineRule({
	name: 'flattenSums',
	appliesTo: isSum,
	transform,
})
