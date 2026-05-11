import { type Power, power } from '../../../../construction'

import { type RootLike, isRootLike, recreateRootLike } from '../utils'

export function pullExponentsIntoRoots(node: Power): Power | RootLike {
	return isRootLike(node.base) ? recreateRootLike(node.base, power(node.base.argument, node.exponent)) : node
}
