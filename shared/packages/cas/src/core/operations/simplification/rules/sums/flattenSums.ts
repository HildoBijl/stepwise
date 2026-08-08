import { Sum } from '../../../../construction'

import { isSum } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Sum): Sum {
	const terms = node.terms.flatMap(term => isSum(term) ? term.terms : [term])
	return terms.length === node.terms.length ? node : new Sum(terms)
}

export const flattenSums = defineRule({
	appliesTo: isSum,
	transform,
})
