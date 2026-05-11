import { type ExpressionNode } from '../../../../construction'

import { isConstantNode, isFloatNode, isIntegerNode } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { turnFloatsIntoIntegers } from './turnFloatsIntoIntegers'
import { factorizeIntegers } from './factorizeIntegers'

export function simplifyConstants(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (!isConstantNode(node)) return node
	if (isFloatNode(node) && context.simplificationOptions.turnFloatsIntoIntegers) node = turnFloatsIntoIntegers(node)
	if (isIntegerNode(node) && context.simplificationOptions.factorizeIntegers) node = factorizeIntegers(node)
	return node
}
