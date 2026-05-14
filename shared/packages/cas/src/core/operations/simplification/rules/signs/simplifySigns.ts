import { type ExpressionNode } from '../../../../construction'

import { isSignNode } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { removeDoubleNegatives } from './removeDoubleNegatives'
import { removeMinusFromZero } from './removeMinusFromZero'
import { removeDoublePlusMinusSigns } from './removeDoublePlusMinusSigns'

export function simplifySigns(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isSignNode(node) && options.has('removeDoubleNegatives')) node = removeDoubleNegatives(node)
	if (isSignNode(node) && options.has('removeMinusFromZero')) node = removeMinusFromZero(node)
	if (isSignNode(node) && options.has('removeDoubleNegatives') && options.has('removeDoublePlusMinusSigns')) node = removeDoublePlusMinusSigns(node)
	return node
}
