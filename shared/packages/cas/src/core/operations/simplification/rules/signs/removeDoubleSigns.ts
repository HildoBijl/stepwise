import { type SignNode, plusMinus } from '../../../../construction'

import { isSignNode, isPlusMinus } from '../../../structural'

export function removeDoubleSigns(node: SignNode): SignNode {
	if (isSignNode(node.node) && (isPlusMinus(node) || isPlusMinus(node.node))) return plusMinus(node.node.node)
	return node
}
