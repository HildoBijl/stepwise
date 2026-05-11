import { type Sqrt, type Root, Integer, root } from '../../../../construction'

import { isSqrt } from '../../../structural'

export function turnSqrtsIntoBaseTwoRoots(node: Sqrt): Sqrt | Root {
	return isSqrt(node) ? root(node.argument, Integer.two) : node
}
