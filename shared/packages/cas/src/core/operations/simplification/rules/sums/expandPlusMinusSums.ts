import { type PlusMinus, type Sum, plusMinus, sum } from '../../../../construction'

import { isSum } from '../../../structural'

export function expandPlusMinusSums(node: PlusMinus): Sum | PlusMinus {
	return isSum(node.node) ? sum(...node.node.terms.map(plusMinus)) as Sum : node
}
