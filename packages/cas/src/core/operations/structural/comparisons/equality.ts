import { compareNumbers } from '@step-wise/utils'

import type { ExpressionNode, SignNode, ConstantNode, FunctionNode, ListNode, Variable } from '../../../construction'

import { isSignNode, isConstantNode, isNamedConstant, isFunctionNode, isListNode, isVariable } from '../fundamentals'

export function equalNodes(a: ExpressionNode, b: ExpressionNode, allowOrderChanges = true): boolean {
	if (isConstantNode(a) && isConstantNode(b)) return equalConstants(a, b)
	if (isSignNode(a) && isSignNode(b)) return equalSignNodes(a, b, allowOrderChanges)
	if (isVariable(a) && isVariable(b)) return equalVariables(a, b)
	if (isListNode(a) && isListNode(b)) return equalLists(a, b, allowOrderChanges)
	if (isFunctionNode(a) && isFunctionNode(b)) return equalFunctions(a, b, allowOrderChanges)
	if (a.constructor !== b.constructor) return false
	return a.children.length === 0 && b.children.length === 0
}

export function equalConstants(a: ConstantNode, b: ConstantNode): boolean {
	if (isNamedConstant(a) && isNamedConstant(b)) return a.symbol === b.symbol
	return a.constructor === b.constructor && compareNumbers(a.value, b.value)
}

export function equalSignNodes(a: SignNode, b: SignNode, allowOrderChanges: boolean): boolean {
	return a.constructor === b.constructor && equalNodes(a.node, b.node, allowOrderChanges)
}

export function equalVariables(a: Variable, b: Variable): boolean {
	return a.symbol === b.symbol && a.subscript === b.subscript && a.accent === b.accent
}

export function equalLists(a: ListNode, b: ListNode, allowOrderChanges: boolean): boolean {
	// Check basic scenarios.
	if (a.constructor !== b.constructor) return false
	if (a.nodes.length !== b.nodes.length) return false
	if (!allowOrderChanges) return a.nodes.every((node, index) => equalNodes(node, b.nodes[index], allowOrderChanges))

	// Find a matching between nodes.
	const used = new Set<number>()
	return a.nodes.every(node => {
		const index = b.nodes.findIndex((candidate, candidateIndex) => !used.has(candidateIndex) && equalNodes(node, candidate, allowOrderChanges))
		if (index === -1) return false
		used.add(index)
		return true
	})
}

export function equalFunctions(a: FunctionNode, b: FunctionNode, allowOrderChanges: boolean): boolean {
	return a.constructor === b.constructor && a.args.length === b.args.length && a.args.every((arg, index) => equalNodes(arg, b.args[index], allowOrderChanges))
}
