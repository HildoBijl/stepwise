import { Sum } from '../../../../construction'

import { isSum } from '../../../structural'

export function flattenSums(node: Sum): Sum {
	const terms = node.terms.flatMap(term => isSum(term) ? term.terms : [term])
	return terms.length === node.terms.length ? node : new Sum(terms)
}
