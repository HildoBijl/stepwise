import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionSettings, defaultExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { replaceDescendants } from '../../structural'

import { type SimplificationPreset, type SimplificationContext, validateSimplificationOptions } from '../definitions'

import { applySimplificationRules } from './simplifyPipeline'

export function simplify(node: ExpressionNode, options: Partial<SimplificationPreset> = {}, settings: Partial<ExpressionSettings> = {}): ExpressionNode {
	const optionSequence = Array.isArray(options) ? options : [options]
	let current = node
	for (const options of optionSequence) current = simplifyUntilStable(current, { options: validateSimplificationOptions(options), settings: mergeDefaults(settings, defaultExpressionSettings) })
	return current
}

function simplifyUntilStable(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	let current = node
	for (let iteration = 0; iteration < 10; iteration++) {
		const next = simplifyOnce(current, context)
		if (next === current) return current
		current = next
	}
	throw new Error('Simplification did not stabilize. Some of the simplification options lock each other in an infinite loop.')
}

function simplifyOnce(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return replaceDescendants(node, descendant => applySimplificationRules(descendant, context))
}
