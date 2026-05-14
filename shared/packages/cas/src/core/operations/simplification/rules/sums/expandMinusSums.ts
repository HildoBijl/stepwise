import { type Minus, type Sum, negative, sum } from '../../../../construction'

import { isSum } from '../../../structural'

export function expandMinusSums(node: Minus): Sum | Minus {
	return isSum(node.node) ? sum(...node.node.terms.map(negative)) as Sum : node
}
