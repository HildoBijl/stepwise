// reducePowersWithZeroExponent.ts
import { type Power, Integer } from '../../../../construction'

import { isZero } from '../../../structural'

export function reducePowersWithZeroExponent(node: Power): Power | Integer {
	return isZero(node.exponent) && !isZero(node.base) ? Integer.one : node
}
