import { type Power, Integer } from '../../../../construction'

import { isOne } from '../../../structural'

export function reducePowersWithOneBase(node: Power): Power | Integer {
	return isOne(node.base) ? Integer.one : node
}
