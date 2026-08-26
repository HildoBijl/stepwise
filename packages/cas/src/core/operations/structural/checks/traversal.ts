import { count } from '@step-wise/js-utils'

import { ExpressionNode } from '../../../construction'

export type NodeAncestors = readonly ExpressionNode[]
export type NodeCheck = (node: ExpressionNode, ancestors: NodeAncestors) => boolean
export type NodeFunction = (node: ExpressionNode, ancestors: NodeAncestors) => void
export type TraversalOptions = { includeSelf?: boolean }
export type OrderedTraversalOptions = TraversalOptions & { childrenFirst?: boolean }

// Non-recursive checks on children.
export function someChild(node: ExpressionNode, check: NodeCheck, options: TraversalOptions = {}): boolean {
	const { includeSelf = false } = options
	return (includeSelf && check(node, [])) || node.children.some(child => check(child, [node]))
}
export function everyChild(node: ExpressionNode, check: NodeCheck, options: TraversalOptions = {}): boolean {
	const { includeSelf = false } = options
	return (!includeSelf || check(node, [])) && node.children.every(child => check(child, [node]))
}

// Recursive checks on nodes and their children.
export function someDescendant(node: ExpressionNode, check: NodeCheck, options: TraversalOptions = {}): boolean {
	return someDescendantInternal(node, check, options.includeSelf ?? true, [])
}
function someDescendantInternal(node: ExpressionNode, check: NodeCheck, includeSelf: boolean, ancestors: NodeAncestors): boolean {
	return (includeSelf && check(node, ancestors)) || node.children.some(child => someDescendantInternal(child, check, true, [...ancestors, node]))
}

export function everyDescendant(node: ExpressionNode, check: NodeCheck, options: TraversalOptions = {}): boolean {
	return everyDescendantInternal(node, check, options.includeSelf ?? true, [])
}
function everyDescendantInternal(node: ExpressionNode, check: NodeCheck, includeSelf: boolean, ancestors: NodeAncestors): boolean {
	return (!includeSelf || check(node, ancestors)) && node.children.every(child => everyDescendantInternal(child, check, true, [...ancestors, node]))
}

// Run a function for each descendant.
export function forEachDescendant(node: ExpressionNode, func: NodeFunction, options: OrderedTraversalOptions = {}): void {
	forEachDescendantInternal(node, func, options.childrenFirst ?? false, options.includeSelf ?? true, [])
}
function forEachDescendantInternal(node: ExpressionNode, func: NodeFunction, childrenFirst: boolean, includeSelf: boolean, ancestors: NodeAncestors): void {
	if (includeSelf && !childrenFirst) func(node, ancestors)
	node.children.forEach(child => forEachDescendantInternal(child, func, childrenFirst, true, [...ancestors, node]))
	if (includeSelf && childrenFirst) func(node, ancestors)
}

// Find a node in the expression tree meeting a condition. Overload with a typescript type cast.
export function findDescendant<T extends ExpressionNode = ExpressionNode>(node: ExpressionNode, check: (node: ExpressionNode, ancestors: NodeAncestors) => node is T, options?: OrderedTraversalOptions): T | undefined
export function findDescendant(node: ExpressionNode, check: NodeCheck, options?: OrderedTraversalOptions): ExpressionNode | undefined
export function findDescendant(node: ExpressionNode, check: NodeCheck, options: OrderedTraversalOptions = {}): ExpressionNode | undefined {
	return findDescendantInternal(node, check, options.childrenFirst ?? false, options.includeSelf ?? true, [])
}
function findDescendantInternal(node: ExpressionNode, check: NodeCheck, childrenFirst: boolean, includeSelf: boolean, ancestors: NodeAncestors): ExpressionNode | undefined {
	if (includeSelf && !childrenFirst && check(node, ancestors)) return node
	for (const child of node.children) {
		const found = findDescendantInternal(child, check, childrenFirst, true, [...ancestors, node])
		if (found) return found
	}
	if (includeSelf && childrenFirst && check(node, ancestors)) return node
}

// Count descendants satisfying a condition.
export function countDescendants(node: ExpressionNode, check: NodeCheck, options: TraversalOptions = {}): number {
	return countDescendantsInternal(node, check, options.includeSelf ?? true, [])
}
function countDescendantsInternal(node: ExpressionNode, check: NodeCheck, includeSelf: boolean, ancestors: NodeAncestors): number {
	return (includeSelf && check(node, ancestors) ? 1 : 0) + count(node.children, child => countDescendantsInternal(child, check, true, [...ancestors, node]))
}

// Extract a list of descendants.
export function getDescendants(node: ExpressionNode, options: TraversalOptions = {}): ExpressionNode[] {
	return getDescendantsInternal(node, options.includeSelf ?? true)
}
function getDescendantsInternal(node: ExpressionNode, includeSelf: boolean): ExpressionNode[] {
	return [
		...(includeSelf ? [node] : []),
		...node.children.flatMap(child => getDescendantsInternal(child, true)),
	]
}
