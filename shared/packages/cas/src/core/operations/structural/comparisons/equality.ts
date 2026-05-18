import { compareNumbers, mergeDefaults } from '@step-wise/utils'

import type { ExpressionNode, SignNode, ConstantNode, FunctionNode, ListNode, Variable } from '../../../construction'

import { isSignNode, isConstantNode, isFunctionNode, isListNode, isVariable } from '../fundamentals'

import { type ExpressionComparisonSettingsInput, type ExpressionComparisonSettings, asExpressionComparisonSettings, asStrictExpressionComparisonSettings } from './comparisonSettings'

export function equalNodes(a: ExpressionNode, b: ExpressionNode, comparisonSettings: ExpressionComparisonSettingsInput = {}): boolean {
	const settings = asExpressionComparisonSettings(comparisonSettings)
	if (isConstantNode(a) && isConstantNode(b)) return equalConstants(a, b)
	if (isSignNode(a) && isSignNode(b)) return equalSignNodes(a, b, settings)
	if (isVariable(a) && isVariable(b)) return equalVariables(a, b)
	if (isListNode(a) && isListNode(b)) return equalLists(a, b, settings)
	if (isFunctionNode(a) && isFunctionNode(b)) return equalFunctions(a, b, settings)
	if (a.constructor !== b.constructor) return false
	return a.children.length === 0 && b.children.length === 0
}

export function strictEqualNodes(a: ExpressionNode, b: ExpressionNode, comparisonSettings: ExpressionComparisonSettingsInput = {}): boolean {
	return equalNodes(a, b, asStrictExpressionComparisonSettings(comparisonSettings))
}

export function equalConstants(a: ConstantNode, b: ConstantNode): boolean {
	return a.constructor === b.constructor && compareNumbers(a.value, b.value)
}

export function equalSignNodes(a: SignNode, b: SignNode, comparisonSettings: ExpressionComparisonSettings): boolean {
	return a.constructor === b.constructor && equalNodes(a.node, b.node, comparisonSettings)
}

export function equalVariables(a: Variable, b: Variable): boolean {
	return a.symbol === b.symbol && a.subscript === b.subscript && a.accent === b.accent
}

export function equalLists(a: ListNode, b: ListNode, comparisonSettings: ExpressionComparisonSettings): boolean {
	// Check basic scenarios.
	if (a.constructor !== b.constructor) return false
	if (a.nodes.length !== b.nodes.length) return false
	if (!comparisonSettings.allowOrderChanges) return a.nodes.every((node, index) => equalNodes(node, b.nodes[index], comparisonSettings))

	// Find a matching between nodes.
	const used = new Set<number>()
	return a.nodes.every(node => {
		const index = b.nodes.findIndex((candidate, candidateIndex) => !used.has(candidateIndex) && equalNodes(node, candidate, comparisonSettings))
		if (index === -1) return false
		used.add(index)
		return true
	})
}

export function equalFunctions(a: FunctionNode, b: FunctionNode, comparisonSettings: ExpressionComparisonSettings): boolean {
	return a.constructor === b.constructor && a.args.length === b.args.length && a.args.every((arg, index) => equalNodes(arg, b.args[index], comparisonSettings))
}
