import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { replaceDescendants } from '../../structural'

import { type SimplificationPreset, type SimplificationContext, validateSimplificationOptions, getActiveSimplificationOptions } from '../definitions'

import { applySimplificationRules } from './simplifyPipeline'

export function simplify(node: ExpressionNode, options: Partial<SimplificationPreset> = {}, settings: Partial<ExpressionSettings> = {}): ExpressionNode {
	const expressionSettings = mergeDefaults(settings, defaultExpressionSettings)
	const optionSequence = Array.isArray(options) ? options : [options]
	let current = node
	for (const options of optionSequence) {
		const context: SimplificationContext = {
			simplificationOptions: validateSimplificationOptions(options),
			expressionSettings,
			simplify: (node, options) => simplify(node, options, expressionSettings),
		}
		current = simplifyUntilStable(current, context)
	}
	return current
}

function simplifyUntilStable(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	let current = node
	for (let iteration = 0; iteration < 10; iteration++) {
		const next = simplifyOnce(current, context)
		if (next === current) return current
		current = next
	}
	throw new Error(`Simplification did not stabilize. Some of the simplification options lock each other in an infinite loop. Simplifications used: [${getActiveSimplificationOptions(context.simplificationOptions).map(str => `'${str}'`).join(', ')}]`)
}

function simplifyOnce(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return replaceDescendants(node, descendant => applySimplificationRules(descendant, context))
}
