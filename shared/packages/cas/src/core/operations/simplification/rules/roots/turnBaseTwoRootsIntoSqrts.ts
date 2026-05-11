import { type Root, type Sqrt, sqrt } from '../../../../construction'

import { isRoot, isTwo } from '../../../structural'

export function turnBaseTwoRootsIntoSqrts(node: Root): Root | Sqrt {
	return isRoot(node) && isTwo(node.base) ? sqrt(node.argument) : node
}
