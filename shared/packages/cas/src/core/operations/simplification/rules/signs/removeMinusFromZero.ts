import { type Sign, type Integer } from '../../../../construction'

import { isZero } from '../../../structural'

export function removeMinusFromZero(node: Sign): Integer | Sign {
	return isZero(node.node) ? node.node : node
}
