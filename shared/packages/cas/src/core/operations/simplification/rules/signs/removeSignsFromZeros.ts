import { type SignNode, type ConstantNode } from '../../../../construction'

import { isZero } from '../../../structural'

export function removeSignsFromZeros(node: SignNode): ConstantNode | SignNode {
	return isZero(node.node) ? node.node : node
}
