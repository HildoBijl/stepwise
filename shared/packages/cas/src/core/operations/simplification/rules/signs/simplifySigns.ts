import { type ExpressionNode } from '../../../../construction'

import { isSignNode } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { removeDoubleNegatives } from './removeDoubleNegatives'
import { removeMinusFromZero } from './removeMinusFromZero'
import { removeDoublePlusMinusSigns } from './removeDoublePlusMinusSigns'

export function simplifySigns(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isSignNode(node) && context.simplificationOptions.removeDoubleNegatives) node = removeDoubleNegatives(node)
	if (isSignNode(node) && context.simplificationOptions.removeMinusFromZero) node = removeMinusFromZero(node)
	if (isSignNode(node) && context.simplificationOptions.removeDoubleNegatives && context.simplificationOptions.removeDoublePlusMinusSigns) node = removeDoublePlusMinusSigns(node)
	return node
}
