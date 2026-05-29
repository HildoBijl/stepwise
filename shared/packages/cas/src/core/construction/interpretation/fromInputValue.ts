import { mergeDefaults } from '@step-wise/utils'
import { type ExpressionInputValue, asInterpretationSettings } from '@step-wise/math-input-value'

import { type ExpressionNode, Variable, isNamedConstantReferral, getNamedConstant } from '../nodes'

import type { InterpreterContext } from './types'
import { interpretBrackets, interpretProducts, interpretConstructWithParameterAfter, interpretStringsAndElements, interpretSums } from './steps'

// Turn an InputValue to an ExpressionNode. Interpreting functions successively call themselves.
export function inputValueToNode(input: ExpressionInputValue): ExpressionNode {
	const interpretationSettings = asInterpretationSettings(input.interpretationSettings ?? {})
	const context: InterpreterContext = { interpretationSettings, interpretBrackets, interpretSums, interpretProducts, interpretStringsAndElements, interpretConstructWithParameterAfter: interpretConstructWithParameterAfter } satisfies InterpreterContext
	const result = interpretBrackets(input.value, context)
	return insertNamedConstants(result)
}

// Turn variables equal to a named constant (like 'e', 'pi', etcetera) to NamedConstants.
function insertNamedConstants(node: ExpressionNode): ExpressionNode {
	if (node instanceof Variable) return isNamedConstantReferral(node.symbol) && !node.subscript && !node.accent ? getNamedConstant(node.symbol) : node
	return node.recreateWithChildren(node.children.map(insertNamedConstants))
}
