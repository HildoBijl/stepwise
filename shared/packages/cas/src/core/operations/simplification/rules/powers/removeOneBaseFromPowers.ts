import { type Power, Integer } from '../../../../construction'

import { isOne } from '../../../structural'

export function removeOneBaseFromPowers(node: Power): Power | Integer {
	return isOne(node.base) ? Integer.one : node
}
