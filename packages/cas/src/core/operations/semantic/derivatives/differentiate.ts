import { type ExpressionSettingsOptions, resolveExpressionSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, type VariableInput, asVariable } from '../../../construction'

import { simplify, removeTrivial } from '../../simplification'

import { type DerivativeContext } from './types'
import { applyDerivativeRules } from './rules'

export function differentiate(node: ExpressionNode, variable: VariableInput, settings?: ExpressionSettingsOptions): ExpressionNode {
	// Set up the context.
	const context: DerivativeContext = {
		variable: asVariable(variable),
		expressionSettings: resolveExpressionSettings(settings),
		differentiate: (node: ExpressionNode) => applyDerivativeRules(node, context),
	}

	// Find the derivative and apply basic simplifications.
	const derivative = applyDerivativeRules(node, context)
	return simplify(derivative, context.expressionSettings, removeTrivial)
}
