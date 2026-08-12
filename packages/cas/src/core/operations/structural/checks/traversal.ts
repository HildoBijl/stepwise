import { count } from '@step-wise/utils'

import { ExpressionNode } from '../../../construction'

export type NodeAncestors = readonly ExpressionNode[]
export type NodeCheck = (node: ExpressionNode, ancestors: NodeAncestors) => boolean
export type NodeFunction = (node: ExpressionNode, ancestors: NodeAncestors) => void

// Non-recursive checks on children.
export function someChild(node: ExpressionNode, check: NodeCheck, includeSelf = false): boolean {
	return (includeSelf && check(node, [])) || node.children.some(child => check(child, [node]))
}
export function everyChild(node: ExpressionNode, check: NodeCheck, includeSelf = false): boolean {
	return (!includeSelf || check(node, [])) && node.children.every(child => check(child, [node]))
}

// Recursive checks on nodes and their children.
export function someDescendant(node: ExpressionNode, check: NodeCheck, includeSelf = true, ancestors: NodeAncestors = []): boolean {
	return (includeSelf && check(node, ancestors)) || node.children.some(child => someDescendant(child, check, true, [...ancestors, node]))
}
export function everyDescendant(node: ExpressionNode, check: NodeCheck, includeSelf = true, ancestors: NodeAncestors = []): boolean {
	return (!includeSelf || check(node, ancestors)) && node.children.every(child => everyDescendant(child, check, true, [...ancestors, node]))
}

// Run a function for each descendant.
export function forEachDescendant(node: ExpressionNode, func: NodeFunction, childrenFirst = false, includeSelf = true, ancestors: NodeAncestors = []): void {
	if (includeSelf && !childrenFirst) func(node, ancestors)
	node.children.forEach(child => forEachDescendant(child, func, true, childrenFirst, [...ancestors, node]))
	if (includeSelf && childrenFirst) func(node, ancestors)
}

// Find a node in the expression tree meeting a condition. Overload with a typescript type cast.
export function findDescendant<T extends ExpressionNode = ExpressionNode>(node: ExpressionNode, check: (node: ExpressionNode, ancestors: NodeAncestors) => node is T, childrenFirst?: boolean, includeSelf?: boolean, ancestors?: NodeAncestors): T | undefined
export function findDescendant(node: ExpressionNode, check: NodeCheck, childrenFirst?: boolean, includeSelf?: boolean, ancestors?: NodeAncestors): ExpressionNode | undefined
export function findDescendant(node: ExpressionNode, check: NodeCheck, childrenFirst = false, includeSelf = true, ancestors: NodeAncestors = []): ExpressionNode | undefined {
	if (includeSelf && !childrenFirst && check(node, ancestors)) return node
	for (const child of node.children) {
		const found = findDescendant(child, check, childrenFirst, true, [...ancestors, node])
		if (found) return found
	}
	if (includeSelf && childrenFirst && check(node, ancestors)) return node
}

// Count descendants satisfying a condition.
export function countDescendants(node: ExpressionNode, check: NodeCheck, includeSelf = true, ancestors: NodeAncestors = []): number {
	return (includeSelf && check(node, ancestors) ? 1 : 0) + count(node.children, child => countDescendants(child, check, true, [...ancestors, node]))
}

// Extract a list of descendants.
export function getDescendants(node: ExpressionNode, includeSelf = true): ExpressionNode[] {
	return [
		...(includeSelf ? [node] : []),
		...node.children.flatMap(child => getDescendants(child, true)),
	]
}
