import { type Root, type Sqrt, sqrt } from '../../../../construction'

import { isRoot, isTwo } from '../../../structural'

export function turnDegreeTwoRootsIntoSqrts(node: Root): Root | Sqrt {
	return isRoot(node) && isTwo(node.degree) ? sqrt(node.radicand) : node
}
