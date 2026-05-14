import { type ExpressionNode } from '../../../../construction'

import { isConstantNode, isFloatNode, isIntegerNode } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { turnFloatsIntoIntegers } from './turnFloatsIntoIntegers'
import { factorizeIntegers } from './factorizeIntegers'

export function simplifyConstants(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isFloatNode(node) && options.has('turnFloatsIntoIntegers')) node = turnFloatsIntoIntegers(node)
	if (isIntegerNode(node) && options.has('factorizeIntegers')) node = factorizeIntegers(node)
	return node
}
