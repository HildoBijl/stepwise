import { ExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode } from '../../../construction'

import { replaceDescendants } from '../../structural'

import { type SimplificationPreset, type SimplificationContext } from '../definitions'

import { applySimplificationRules } from './simplifyPipeline'

export function simplify(node: ExpressionNode, options: SimplificationPreset, settings: ExpressionSettings): ExpressionNode {
	const optionSequence = Array.isArray(options) ? options : [options]
	let current = node
	for (const options of optionSequence) current = simplifyUntilStable(current, { options, settings })
	return current
}

function simplifyUntilStable(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	let current = node
	for (let iteration = 0; iteration < 5; iteration++) {
		const next = simplifyOnce(current, context)
		if (next === current) return current
		current = next
	}
	throw new Error('Simplification did not stabilize.')
}

function simplifyOnce(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	return replaceDescendants(node, descendant => applySimplificationRules(descendant, context))
}
