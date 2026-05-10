import { type Sum, type Product, sum, product } from '../../../../construction'

import { getCommonFactors, removeFactors } from '../utils'

export function pullOutCommonSumFactors(node: Sum): Sum | Product {
	const commonFactors = getCommonFactors(...node.terms)
	if (commonFactors.length === 0) return node
	const terms = node.terms.map(term => removeFactors(term, commonFactors))
	return product(...commonFactors, sum(...terms)) as Product
}
