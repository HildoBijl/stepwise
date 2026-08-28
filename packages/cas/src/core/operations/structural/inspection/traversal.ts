import { count } from '@step-wise/js-utils'

import { ExpressionNode } from '../../../construction/index.ts'

export type NodeAncestors = readonly ExpressionNode[]
export type NodePredicate = (node: ExpressionNode, ancestors: NodeAncestors) => boolean
export type NodeVisitor = (node: ExpressionNode, ancestors: NodeAncestors) => void
export type TraversalOptions = { includeSelf?: boolean }
export type OrderedTraversalOptions = TraversalOptions & { childrenFirst?: boolean }

// Non-recursive checks on children.
export function someChild(node: ExpressionNode, check: NodePredicate, options: TraversalOptions = {}): boolean {
	const { includeSelf = false } = options
	return (includeSelf && check(node, [])) || node.children.some(child => check(child, [node]))
}
export function everyChild(node: ExpressionNode, check: NodePredicate, options: TraversalOptions = {}): boolean {
	const { includeSelf = false } = options
	return (!includeSelf || check(node, [])) && node.children.every(child => check(child, [node]))
}

// Recursive checks across an expression tree.
export function someNode(node: ExpressionNode, check: NodePredicate, options: TraversalOptions = {}): boolean {
	return someNodeInternal(node, check, options.includeSelf ?? true, [])
}
function someNodeInternal(node: ExpressionNode, check: NodePredicate, includeSelf: boolean, ancestors: NodeAncestors): boolean {
	return (includeSelf && check(node, ancestors)) || node.children.some(child => someNodeInternal(child, check, true, [...ancestors, node]))
}

export function everyNode(node: ExpressionNode, check: NodePredicate, options: TraversalOptions = {}): boolean {
	return everyNodeInternal(node, check, options.includeSelf ?? true, [])
}
function everyNodeInternal(node: ExpressionNode, check: NodePredicate, includeSelf: boolean, ancestors: NodeAncestors): boolean {
	return (!includeSelf || check(node, ancestors)) && node.children.every(child => everyNodeInternal(child, check, true, [...ancestors, node]))
}

// Visit every selected node in an expression tree.
export function forEachNode(node: ExpressionNode, visitor: NodeVisitor, options: OrderedTraversalOptions = {}): void {
	forEachNodeInternal(node, visitor, options.childrenFirst ?? false, options.includeSelf ?? true, [])
}
function forEachNodeInternal(node: ExpressionNode, visitor: NodeVisitor, childrenFirst: boolean, includeSelf: boolean, ancestors: NodeAncestors): void {
	if (includeSelf && !childrenFirst) visitor(node, ancestors)
	node.children.forEach(child => forEachNodeInternal(child, visitor, childrenFirst, true, [...ancestors, node]))
	if (includeSelf && childrenFirst) visitor(node, ancestors)
}

// Find a node in the expression tree meeting a condition. Overload with a typescript type cast.
export function findNode<T extends ExpressionNode = ExpressionNode>(node: ExpressionNode, check: (node: ExpressionNode, ancestors: NodeAncestors) => node is T, options?: OrderedTraversalOptions): T | undefined
export function findNode(node: ExpressionNode, check: NodePredicate, options?: OrderedTraversalOptions): ExpressionNode | undefined
export function findNode(node: ExpressionNode, check: NodePredicate, options: OrderedTraversalOptions = {}): ExpressionNode | undefined {
	return findNodeInternal(node, check, options.childrenFirst ?? false, options.includeSelf ?? true, [])
}
function findNodeInternal(node: ExpressionNode, check: NodePredicate, childrenFirst: boolean, includeSelf: boolean, ancestors: NodeAncestors): ExpressionNode | undefined {
	if (includeSelf && !childrenFirst && check(node, ancestors)) return node
	for (const child of node.children) {
		const found = findNodeInternal(child, check, childrenFirst, true, [...ancestors, node])
		if (found) return found
	}
	if (includeSelf && childrenFirst && check(node, ancestors)) return node
}

// Count selected nodes satisfying a condition.
export function countNodes(node: ExpressionNode, check: NodePredicate, options: TraversalOptions = {}): number {
	return countNodesInternal(node, check, options.includeSelf ?? true, [])
}
function countNodesInternal(node: ExpressionNode, check: NodePredicate, includeSelf: boolean, ancestors: NodeAncestors): number {
	return (includeSelf && check(node, ancestors) ? 1 : 0) + count(node.children, child => countNodesInternal(child, check, true, [...ancestors, node]))
}

// Extract selected nodes into a list.
export function getNodes(node: ExpressionNode, options: TraversalOptions = {}): ExpressionNode[] {
	return getNodesInternal(node, options.includeSelf ?? true)
}
function getNodesInternal(node: ExpressionNode, includeSelf: boolean): ExpressionNode[] {
	return [
		...(includeSelf ? [node] : []),
		...node.children.flatMap(child => getNodesInternal(child, true)),
	]
}
