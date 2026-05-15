import { type Power, type RootLike, power } from '../../../../construction'

import { isRootLike } from '../../../structural'

export function pullExponentsIntoRoots(node: Power): Power | RootLike {
	return isRootLike(node.base) ? node.base.recreateWith(power(node.base.radicand, node.exponent)) : node
}
