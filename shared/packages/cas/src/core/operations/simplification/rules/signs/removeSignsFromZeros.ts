import { type Sign, type ConstantNode } from '../../../../construction'

import { isZero } from '../../../structural'

export function removeSignsFromZeros(node: Sign): ConstantNode | Sign {
	return isZero(node.node) ? node.node : node
}
