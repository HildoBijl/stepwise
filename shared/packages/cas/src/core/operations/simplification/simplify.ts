import { setToString } from '@step-wise/utils'
import { type ExpressionSettingsInput, asExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, nodeToTree } from '../../construction'

import { mapDescendants } from '../structural'

import { type SimplificationOptionsInput, type SimplificationContext, asSimplificationOptionsSet, validateSimplificationOptions } from './simplificationOptions'
import { applySimplificationRules } from './rules'

// Take some form of simplification option input, process it, and apply it to the node.
export function simplify(node: ExpressionNode, settings: ExpressionSettingsInput = {}, options: SimplificationOptionsInput = []): ExpressionNode {
	const expressionSettings = asExpressionSettings(settings)
	const simplificationOptions = validateSimplificationOptions(asSimplificationOptionsSet(options))
	const context: SimplificationContext = {
		simplificationOptions,
		expressionSettings,
		parents: [],
		simplify: (node, options = simplificationOptions) => simplify(node, expressionSettings, options),
	}
	return simplifyUntilStable(node, context)
}

// Repeat the simplification options until there are no more changes. Simplifications should stabilize.
function simplifyUntilStable(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	let current = node
	for (let iteration = 0; iteration < 20; iteration++) {
		const next = simplifyOnce(current, context)
		if (next === current) return current
		current = next
	}
	throw new Error(`Simplification did not stabilize. Some of the simplification options lock each other in an infinite loop.\nFinal expression: ${nodeToTree(current)}\nSimplifications used: ${setToString(context.simplificationOptions)}`)
}

// Run a set of simplification operations once on all nodes.
function simplifyOnce(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return mapDescendants(node, (descendant, parents) => applySimplificationRules(descendant, { ...context, parents }))
}
