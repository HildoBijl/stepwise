import { type Power, Integer } from '../../../../construction'

import { isZero } from '../../../structural'

export function reducePowersWithZeroBase(node: Power): Power | Integer {
	return isZero(node.base) && !isZero(node.exponent) ? Integer.zero : node
}
