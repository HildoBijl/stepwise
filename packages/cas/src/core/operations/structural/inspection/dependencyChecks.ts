import { type VariableInput, ExpressionNode, Variable, variableToString, asVariable } from '../../../construction/index.ts'

import { isVariable } from './typeChecks.ts'
import { areVariablesEqual } from './equality.ts'

import { someNode, everyNode, forEachNode } from './traversal.ts'

// Get all variables occurring in an expression.
export function collectVariables(node: ExpressionNode): Variable[] {
	const variables: Record<string, Variable> = {}
	forEachNode(node, descendant => { if (isVariable(descendant)) variables[variableToString(descendant)] = descendant }, { childrenFirst: true })
	return Object.keys(variables).sort().map(key => variables[key])
}

// Get all variable strings occurring in an expression.
export function collectVariableStrings(node: ExpressionNode): Set<string> {
	const result = new Set<string>()
	collectVariables(node).forEach(variable => result.add(variableToString(variable)))
	return result
}

// Check if an expression depends on a given variable.
export function dependsOn(node: ExpressionNode, variable: VariableInput): boolean {
	const variableNode = asVariable(variable)
	return someNode(node, descendant => isVariable(descendant) && areVariablesEqual(variableNode, descendant))
}

// Check if an expression depends on at least one of the given variables.
export function dependsOnAny(node: ExpressionNode, variables: VariableInput[]): boolean {
	return variables.some(variable => dependsOn(node, variable))
}

// Check if an expression depends only on the given variables.
export function dependsOnlyOn(node: ExpressionNode, variables: VariableInput[]): boolean {
	const allowedVariables = new Set(variables.map(variable => variableToString(asVariable(variable))))
	return everyNode(node, descendant => !isVariable(descendant) || allowedVariables.has(variableToString(descendant)))
}
