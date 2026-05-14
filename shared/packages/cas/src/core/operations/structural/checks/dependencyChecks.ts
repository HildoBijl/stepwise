import { type VariableInput, ExpressionNode, Variable, variableToString, asVariable } from '../../../construction'

import { isVariable, someDescendant, everyDescendant, forEachDescendant } from '../fundamentals'
import { equalVariables } from '../comparisons'

// Get all variables occurring in an expression.
export function getVariables(node: ExpressionNode): Variable[] {
	const variables: Record<string, Variable> = {}
	forEachDescendant(node, descendant => { if (isVariable(descendant)) variables[variableToString(descendant)] = descendant }, true)
	return Object.keys(variables).sort().map(key => variables[key])
}

// Get all variable strings occurring in an expression.
export function getVariableStrings(node: ExpressionNode): Set<string> {
	const result = new Set<string>()
	getVariables(node).forEach(variable => result.add(variableToString(variable)))
	return result
}

// Check if an expression depends on a given variable.
export function dependsOn(node: ExpressionNode, variable: VariableInput): boolean {
	const variableNode = asVariable(variable)
	return someDescendant(node, descendant => isVariable(descendant) && equalVariables(variableNode, descendant), true)
}

// Check if an expression depends on at least one of the given variables.
export function dependsOnAny(node: ExpressionNode, variables: VariableInput[]): boolean {
	return variables.some(variable => dependsOn(node, variable))
}

// Check if an expression depends only on the given variables.
export function dependsOnlyOn(node: ExpressionNode, variables: VariableInput[]): boolean {
	const allowedVariables = new Set(variables.map(variable => variableToString(asVariable(variable))))
	return everyDescendant(node, descendant => !isVariable(descendant) || allowedVariables.has(variableToString(descendant)), true)
}
