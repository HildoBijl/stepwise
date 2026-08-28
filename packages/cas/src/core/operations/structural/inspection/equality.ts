import { approximatelyEqual } from '@step-wise/js-utils'

import type { ExpressionNode, SignNode, ConstantNode, FunctionNode, ListNode, Variable } from '../../../construction/index.ts'

import { isSignNode, isConstantNode, isNamedConstant, isFunctionNode, isListNode, isVariable } from './typeChecks.ts'

export function areNodesEqual(a: ExpressionNode, b: ExpressionNode, ignoreOrder = true): boolean {
	if (isConstantNode(a) && isConstantNode(b)) return areConstantsEqual(a, b)
	if (isSignNode(a) && isSignNode(b)) return areSignNodesEqual(a, b, ignoreOrder)
	if (isVariable(a) && isVariable(b)) return areVariablesEqual(a, b)
	if (isListNode(a) && isListNode(b)) return areListsEqual(a, b, ignoreOrder)
	if (isFunctionNode(a) && isFunctionNode(b)) return areFunctionsEqual(a, b, ignoreOrder)
	if (a.constructor !== b.constructor) return false
	return a.children.length === 0 && b.children.length === 0
}

export function areConstantsEqual(a: ConstantNode, b: ConstantNode): boolean {
	if (isNamedConstant(a) && isNamedConstant(b)) return a.symbol === b.symbol
	return a.constructor === b.constructor && approximatelyEqual(a.value, b.value)
}

export function areSignNodesEqual(a: SignNode, b: SignNode, ignoreOrder: boolean): boolean {
	return a.constructor === b.constructor && areNodesEqual(a.node, b.node, ignoreOrder)
}

export function areVariablesEqual(a: Variable, b: Variable): boolean {
	return a.symbol === b.symbol && a.subscript === b.subscript && a.accent === b.accent
}

export function areListsEqual(a: ListNode, b: ListNode, ignoreOrder: boolean): boolean {
	// Check basic scenarios.
	if (a.constructor !== b.constructor) return false
	if (a.nodes.length !== b.nodes.length) return false
	if (!ignoreOrder) return a.nodes.every((node, index) => areNodesEqual(node, b.nodes[index], ignoreOrder))

	// Find a matching between nodes.
	const matchedIndices = new Set<number>()
	return a.nodes.every(node => {
		const index = b.nodes.findIndex((candidate, candidateIndex) => !matchedIndices.has(candidateIndex) && areNodesEqual(node, candidate, ignoreOrder))
		if (index === -1) return false
		matchedIndices.add(index)
		return true
	})
}

export function areFunctionsEqual(a: FunctionNode, b: FunctionNode, ignoreOrder: boolean): boolean {
	return a.constructor === b.constructor && a.args.length === b.args.length && a.args.every((arg, index) => areNodesEqual(arg, b.args[index], ignoreOrder))
}
