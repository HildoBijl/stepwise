import { type ExpressionInputValue, type InterpretationSettings, resolveInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, Variable, isNamedConstantReferral, getNamedConstant } from '../nodes'

import type { InterpreterContext } from './types'
import { interpretBrackets, interpretProducts, interpretConstructWithParameterAfter, interpretStringsAndElements, interpretSums } from './steps'

// Turn an InputValue to an ExpressionNode. Interpreting functions successively call themselves.
export function inputValueToNode(input: ExpressionInputValue): ExpressionNode {
	const interpretationSettings = resolveInterpretationSettings(input.interpretationSettings)
	const context: InterpreterContext = { interpretationSettings, interpretBrackets, interpretSums, interpretProducts, interpretStringsAndElements, interpretConstructWithParameterAfter: interpretConstructWithParameterAfter } satisfies InterpreterContext
	const result = interpretBrackets(input.value, context)
	return insertNamedConstants(result, interpretationSettings)
}

// Turn variables equal to a named constant (like 'e', 'pi', etcetera) to NamedConstants.
function insertNamedConstants(node: ExpressionNode, interpretationSettings: InterpretationSettings): ExpressionNode {
	if (!(node instanceof Variable)) return node.recreateWithChildren(node.children.map(child => insertNamedConstants(child, interpretationSettings)))
	if (!isNamedConstantReferral(node.symbol) || node.subscript || node.accent) return node
	if (node.symbol === 'e' && !interpretationSettings.eAsConstant) return node
	return getNamedConstant(node.symbol)
}
