import { type ExpressionNode } from '../../../../construction'

import { isSignNode, isFloatNode, isIntegerNode } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { removeDoubleNegatives } from './removeDoubleNegatives'
import { removeDoublePlusMinusSigns } from './removeDoublePlusMinusSigns'
import { turnFloatsIntoIntegers } from './turnFloatsIntoIntegers'
import { factorizeIntegers } from './factorizeIntegers'

export function simplifyConstants(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	// Sign nodes
	if (isSignNode(node) && context.options.removeDoubleNegatives) node = removeDoubleNegatives(node)
	if (isSignNode(node) && context.options.removeDoubleNegatives && context.options.removeDoublePlusMinusSigns) node = removeDoublePlusMinusSigns(node)

	// Numbers
	if (isFloatNode(node) && context.options.turnFloatsIntoIntegers) node = turnFloatsIntoIntegers(node)
	if (isIntegerNode(node) && context.options.factorizeIntegers) node = factorizeIntegers(node)

	// All done
	return node
}
