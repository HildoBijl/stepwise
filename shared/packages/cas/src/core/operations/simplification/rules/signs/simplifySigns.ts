import { type ExpressionNode } from '../../../../construction'

import { isMinus, isSignNode } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { removeDoubleNegatives } from './removeDoubleNegatives'
import { removeSignsFromZeros } from './removeSignsFromZeros'
import { removeDoubleSigns } from './removeDoubleSigns'

export function simplifySigns(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isSignNode(node) && options.has('removeSignsFromZeros')) node = removeSignsFromZeros(node)
	if (isMinus(node) && options.has('removeDoubleNegatives')) node = removeDoubleNegatives(node)
	if (isSignNode(node) && options.has('removeDoubleSigns')) node = removeDoubleSigns(node)
	return node
}
