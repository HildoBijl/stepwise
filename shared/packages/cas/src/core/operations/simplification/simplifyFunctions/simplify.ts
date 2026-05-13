import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { replaceDescendants } from '../../structural'

import { type SimplificationOptionsInput, type AddSimplificationOptions, type RemoveSimplificationOptions, type SimplificationPreset, type SimplificationContext, validateSimplificationOptions, getActiveSimplificationOptions, adjustSimplificationOptions } from '../simplificationOptions'

import { applySimplificationRules } from './simplifyPipeline'

// Take some form of simplification option input, process it, and apply it to the node.
export function simplify(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, options: SimplificationOptionsInput = [], addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): ExpressionNode {
	const expressionSettings = mergeDefaults(settings, defaultExpressionSettings)
	const simplificationOptions = validateSimplificationOptions(adjustSimplificationOptions(options, addOptions, removeOptions))
	const context: SimplificationContext = {
		simplificationOptions,
		expressionSettings,
		parents: [],
		simplify: (node, options, addOptions, removeOptions) => simplify(node, expressionSettings, options, addOptions, removeOptions),
	}
	return simplifyUntilStable(node, context)
}

// Legacy Simlification Preset: Run through the (possibly array of) simplification options and apply each set of simplifications.
export function repeatedSimplify(node: ExpressionNode, settings: Partial<ExpressionSettings> = {}, options: Partial<SimplificationPreset> = {}, addOptions: AddSimplificationOptions = [], removeOptions: RemoveSimplificationOptions = []): ExpressionNode {
	const expressionSettings = mergeDefaults(settings, defaultExpressionSettings)
	const optionSequence = Array.isArray(options) ? options : [options]
	let current = node
	for (const options of optionSequence) {
		const simplificationOptions = validateSimplificationOptions(adjustSimplificationOptions(options, addOptions, removeOptions))
		const context: SimplificationContext = {
			simplificationOptions,
			expressionSettings,
			parents: [],
			simplify: (node, options, addOptions, removeOptions) => simplify(node, expressionSettings, options, addOptions, removeOptions),
		}
		current = simplifyUntilStable(current, context)
	}
	return current
}

// Repeat the simplification options until there are no more changes. Simplifications should stabilize.
function simplifyUntilStable(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	let current = node
	for (let iteration = 0; iteration < 10; iteration++) {
		const next = simplifyOnce(current, context)
		if (next === current) return current
		current = next
	}
	throw new Error(`Simplification did not stabilize. Some of the simplification options lock each other in an infinite loop. Simplifications used: [${getActiveSimplificationOptions(context.simplificationOptions).map(str => `'${str}'`).join(', ')}]`)
}

// Run a set of simplification operations once on all nodes.
function simplifyOnce(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return replaceDescendants(node, (descendant, parents) => applySimplificationRules(descendant, { ...context, parents }))
}
