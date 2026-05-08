import { ExpressionNode } from '../../../construction'

// Run a replacer function on each descendant. Start at the leaves and work upwards.
export function replaceDescendants(node: ExpressionNode, replacer: (node: ExpressionNode) => ExpressionNode, includeSelf = true): ExpressionNode {
	const nodeWithReplacedChildren = node.recreateWithChildren(node.children.map(child => replaceDescendants(child, replacer, true)))
	return includeSelf ? replacer(nodeWithReplacedChildren) : nodeWithReplacedChildren
}
