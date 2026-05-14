import { type ExpressionInputValue, type InterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, Variable, isNamedConstantReferral, getNamedConstant } from '../nodes'

import type { InterpreterContext } from './types'
import { interpretBrackets, interpretProducts, interpretSpecialFunctionWithParameterAfter, interpretStringsAndElements, interpretSums } from './steps'

// Turn an InputValue to an ExpressionNode.
export function inputValueToNode(input: ExpressionInputValue, settings: InterpretationSettings): ExpressionNode {
	const context: InterpreterContext = { interpretBrackets, interpretSums, interpretProducts, interpretStringsAndElements, interpretSpecialFunctionWithParameterAfter } satisfies InterpreterContext
	const result = interpretBrackets(input.value, settings, context)
	return insertNamedConstants(result)
}

// Turn variables equal to a named constant (like 'e', 'pi', etcetera) to NamedConstants.
function insertNamedConstants(node: ExpressionNode): ExpressionNode {
	if (node instanceof Variable) return isNamedConstantReferral(node.symbol) && !node.subscript && !node.accent ? getNamedConstant(node.symbol) : node
	return node.recreateWithChildren(node.children.map(insertNamedConstants))
}
