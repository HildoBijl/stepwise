import { type ExpressionInputValue, type InterpretationSettings, isExpressionInputValue, resolveInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, Variable, isNamedConstantReferral, getNamedConstant } from '../nodes'

import type { InterpreterContext } from './types'
import { interpretBrackets, interpretProducts, interpretParts, interpretSums } from './steps'

// Turn an InputValue to an ExpressionNode. Interpreting functions successively call themselves.
export function interpretExpressionInputValue(input: ExpressionInputValue): ExpressionNode {
	if (!isExpressionInputValue(input)) throw new TypeError('Invalid expression input value: expected a structurally valid ExpressionInputValue.')
	const interpretationSettings = resolveInterpretationSettings(input.interpretationSettings)
	const context: InterpreterContext = { interpretationSettings, interpretBrackets, interpretSums, interpretProducts, interpretParts } satisfies InterpreterContext
	const result = interpretBrackets(input.value, context)
	return replaceNamedConstantVariables(result, interpretationSettings)
}

// Turn variables equal to a named constant (like 'e', 'pi', etcetera) to NamedConstants.
function replaceNamedConstantVariables(node: ExpressionNode, interpretationSettings: InterpretationSettings): ExpressionNode {
	if (!(node instanceof Variable)) return node.recreateWithChildren(node.children.map(child => replaceNamedConstantVariables(child, interpretationSettings)))
	if (!isNamedConstantReferral(node.symbol) || node.subscript || node.accent) return node
	if (node.symbol === 'e' && !interpretationSettings.interpretEAsConstant) return node
	return getNamedConstant(node.symbol)
}
