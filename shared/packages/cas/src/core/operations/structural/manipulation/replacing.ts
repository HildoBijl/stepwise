import { ExpressionNode } from '../../../construction'

// Run a replacer function on each descendant. Start at the leaves and work upwards.
export function replaceDescendants(node: ExpressionNode, replacer: (node: ExpressionNode, parents: readonly ExpressionNode[]) => ExpressionNode, includeSelf = true, parents: readonly ExpressionNode[] = []): ExpressionNode {
	const nodeWithReplacedChildren = node.recreateWithChildren(node.children.map(child => replaceDescendants(child, replacer, true, [...parents, node])))
	return includeSelf ? replacer(nodeWithReplacedChildren, parents) : nodeWithReplacedChildren
}
