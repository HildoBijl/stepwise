import { Sum } from '../../../../construction'

import { isZero } from '../../../structural'

export function removePlusZeroFromSums(node: Sum): Sum {
	const terms = node.terms.filter(term => !isZero(term))
	return terms.length === node.terms.length ? node : new Sum(terms)
}
