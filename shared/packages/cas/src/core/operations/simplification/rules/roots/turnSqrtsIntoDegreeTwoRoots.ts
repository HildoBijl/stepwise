import { type Sqrt, type Root, Integer, root } from '../../../../construction'

import { isSqrt } from '../../../structural'

export function turnSqrtsIntoDegreeTwoRoots(node: Sqrt): Sqrt | Root {
	return isSqrt(node) ? root(node.radicand, Integer.two) : node
}
