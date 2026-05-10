import { type ExpressionNode } from '../../../../construction'

import { isConstantNode, isFloatNode, isIntegerNode } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { turnFloatsIntoIntegers } from './turnFloatsIntoIntegers'
import { factorizeIntegers } from './factorizeIntegers'

export function simplifyConstants(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (!isConstantNode(node)) return node
	if (isFloatNode(node) && context.options.turnFloatsIntoIntegers) node = turnFloatsIntoIntegers(node)
	if (isIntegerNode(node) && context.options.factorizeIntegers) node = factorizeIntegers(node)
	return node
}
