import { mergeDefaults, compareNumbers } from '@step-wise/utils'

import type { ExpressionNode, Sign, ConstantNode, FunctionNode, ListNode, Variable } from '../../../construction'

import { type ComparisonSettings, defaultComparisonSettings } from './comparisonSettings'
import { isSignNode, isConstantNode, isFunctionNode, isListNode, isVariableNode } from './typeChecks'

export function equalNodes(a: ExpressionNode, b: ExpressionNode, comparisonSettings: Partial<ComparisonSettings> = {}): boolean {
	const settings = mergeDefaults(comparisonSettings, defaultComparisonSettings)
	if (isSignNode(a) && isSignNode(b)) return equalSignNodes(a, b)
	if (isConstantNode(a) && isConstantNode(b)) return equalConstants(a, b)
	if (isVariableNode(a) && isVariableNode(b)) return equalVariables(a, b)
	if (isListNode(a) && isListNode(b)) return equalLists(a, b, settings)
	if (isFunctionNode(a) && isFunctionNode(b)) return equalFunctions(a, b, settings)
	if (a.constructor !== b.constructor) return false
	return a.children.length === 0 && b.children.length === 0
}

export function equalSignNodes(a: Sign, b: Sign): boolean {
	return a.negative === b.negative && a.plusMinus === b.plusMinus && equalNodes(a.node, b.node)
}

export function equalConstants(a: ConstantNode, b: ConstantNode): boolean {
	return a.constructor === b.constructor && compareNumbers(a.value, b.value)
}

export function equalVariables(a: Variable, b: Variable): boolean {
	return a.symbol === b.symbol && a.subscript === b.subscript && a.accent === b.accent
}

export function equalLists(a: ListNode, b: ListNode, settings: ComparisonSettings): boolean {
	return a.constructor === b.constructor && equalNodeLists(a.terms, b.terms, settings)
}

export function equalNodeLists(a: readonly ExpressionNode[], b: readonly ExpressionNode[], settings: ComparisonSettings): boolean {
	// Check basic scenarios.
	if (a.length !== b.length) return false
	if (!settings.allowOrderChanges) return a.every((node, index) => equalNodes(node, b[index], settings))

	// Find a matching between nodes.
	const used = new Set<number>()
	return a.every(node => {
		const index = b.findIndex((candidate, candidateIndex) => !used.has(candidateIndex) && equalNodes(node, candidate, settings))
		if (index === -1) return false
		used.add(index)
		return true
	})
}

export function equalFunctions(a: FunctionNode, b: FunctionNode, settings: ComparisonSettings): boolean {
	return a.constructor === b.constructor && a.args.length === b.args.length && a.args.every((arg, index) => equalNodes(arg, b.args[index], settings))
}
