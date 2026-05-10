import { type ExpressionNode } from '../../../../construction'

import { isSignNode } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { removeDoubleNegatives } from './removeDoubleNegatives'
import { removeDoublePlusMinusSigns } from './removeDoublePlusMinusSigns'

export function simplifySigns(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isSignNode(node) && context.options.removeDoubleNegatives) node = removeDoubleNegatives(node)
	if (isSignNode(node) && context.options.removeDoubleNegatives && context.options.removeDoublePlusMinusSigns) node = removeDoublePlusMinusSigns(node)
	return node
}
