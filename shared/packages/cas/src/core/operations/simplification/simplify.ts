import { mergeDefaults, setToString } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, nodeToTree } from '../../construction'

import { replaceDescendants } from '../structural'

import { type SimplificationOptionsInput, type SimplificationPreset, type SimplificationContext, type SimplificationOptionsObject, asSimplificationOptionsSet, validateSimplificationOptions, getActiveSimplificationOptions } from './simplificationOptions'
import { applySimplificationRules } from './rules'

// Take some form of simplification option input, process it, and apply it to the node.
export function simplify(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, options: SimplificationOptionsInput = []): ExpressionNode {
	const expressionSettings = mergeDefaults(settings, defaultExpressionSettings)
	const simplificationOptions = validateSimplificationOptions(asSimplificationOptionsSet(options))
	const context: SimplificationContext = {
		simplificationOptions,
		expressionSettings,
		parents: [],
		simplify: (node, options = simplificationOptions) => simplify(node, expressionSettings, options),
	}
	return simplifyUntilStable(node, context)
}

// Legacy Simlification Presets: Run through the (possibly array of) simplification options and apply each set of simplifications.
export function legacySimplify(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, options: Partial<SimplificationPreset> = {}, adjustments: SimplificationOptionsObject = {}): ExpressionNode {
	const expressionSettings = mergeDefaults(settings, defaultExpressionSettings)
	const optionSequence = Array.isArray(options) ? options : [options]
	let current = node
	for (const options of optionSequence) {
		const optionsSet = getActiveSimplificationOptions(mergeDefaults(adjustments, options))
		const simplificationOptions = validateSimplificationOptions(optionsSet)
		const context: SimplificationContext = {
			simplificationOptions,
			expressionSettings,
			parents: [],
			simplify: (node, options) => simplify(node, expressionSettings, options),
		}
		current = simplifyUntilStable(current, context)
	}
	return current
}

// Repeat the simplification options until there are no more changes. Simplifications should stabilize.
function simplifyUntilStable(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	let current = node
	for (let iteration = 0; iteration < 5; iteration++) {
		const next = simplifyOnce(current, context)
		if (next === current) return current
		current = next
	}
	throw new Error(`Simplification did not stabilize. Some of the simplification options lock each other in an infinite loop.\nFinal expression: ${nodeToTree(current)}\nSimplifications used: ${setToString(context.simplificationOptions)}`)
}

// Run a set of simplification operations once on all nodes.
function simplifyOnce(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return replaceDescendants(node, (descendant, parents) => applySimplificationRules(descendant, { ...context, parents }))
}
