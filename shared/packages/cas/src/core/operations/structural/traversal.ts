import { ExpressionNode } from '../../construction'

// Non-recursive checks on children.
export function someChild(node: ExpressionNode, check: (node: ExpressionNode) => boolean, includeSelf = false): boolean {
	return (includeSelf && check(node)) || node.children.some(check)
}
export function everyChild(node: ExpressionNode, check: (node: ExpressionNode) => boolean, includeSelf = false): boolean {
	return (!includeSelf || check(node)) && node.children.every(check)
}

// Recursive checks on nodes and their children.
export function someDescendant(node: ExpressionNode, check: (node: ExpressionNode) => boolean, includeSelf = false): boolean {
	return (includeSelf && check(node)) || node.children.some(child => someDescendant(child, check, true))
}
export function everyDescendant(node: ExpressionNode, check: (node: ExpressionNode) => boolean, includeSelf = false): boolean {
	return (!includeSelf || check(node)) && node.children.every(child => everyDescendant(child, check, true))
}

// Run a function for each descendant.
export function forEachDescendant(node: ExpressionNode, func: (node: ExpressionNode) => void, includeSelf = false): void {
	if (includeSelf) func(node)
	node.children.forEach(child => forEachDescendant(child, func, true))
}

// Extract a list of descendants.
export function getDescendants(node: ExpressionNode, includeSelf = false): ExpressionNode[] {
	return [
		...(includeSelf ? [node] : []),
		...node.children.flatMap(child => getDescendants(child, true)),
	]
}

// Find a node in the expression tree meeting a condition.
export function findDescendant<T extends ExpressionNode = ExpressionNode>(node: ExpressionNode, check: (node: ExpressionNode) => node is T, includeSelf?: boolean): T | undefined
export function findDescendant(node: ExpressionNode, check: (node: ExpressionNode) => boolean, includeSelf?: boolean): ExpressionNode | undefined
export function findDescendant(node: ExpressionNode, check: (node: ExpressionNode) => boolean, includeSelf = false): ExpressionNode | undefined {
	if (includeSelf && check(node)) return node
	return node.children.map(child => findDescendant(child, check, true)).find(result => result !== undefined)
}

// Count descendants satisfying a condition.
export function countDescendants(node: ExpressionNode, check: (node: ExpressionNode) => boolean, includeSelf = false): number {
	return (includeSelf && check(node) ? 1 : 0) + node.children.reduce((sum, child) => sum + countDescendants(child, check, true), 0)
}
