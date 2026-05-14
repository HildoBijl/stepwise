import { type ExpressionNode } from '../../../../construction'

import { isFloatNode, isIntegerNode, isPower } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { turnFloatsIntoIntegers } from './turnFloatsIntoIntegers'
import { factorizeIntegers } from './factorizeIntegers'

export function simplifyConstants(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isFloatNode(node) && options.has('turnFloatsIntoIntegers')) node = turnFloatsIntoIntegers(node)
	if (isIntegerNode(node) && options.has('factorizeIntegers') && !isInExponentOfInteger(node, context)) node = factorizeIntegers(node)
	return node
}

function isInExponentOfInteger(node: ExpressionNode, context: SimplificationContext): boolean {
	return context.parents.some((parent, index) => isPower(parent) && isIntegerNode(parent.base) && parent.exponent === (context.parents[index + 1] ?? node))
}
