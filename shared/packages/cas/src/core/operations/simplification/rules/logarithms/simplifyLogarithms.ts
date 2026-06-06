import { type ExpressionNode } from '../../../../construction'

import { isLogLike } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { reduceLogarithmsWithOneArgument } from './reduceLogarithmsWithOneArgument'
import { reduceLogarithmsWithBaseArgument } from './reduceLogarithmsWithBaseArgument'

export function simplifyLogarithms(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isLogLike(node) && options.has('reduceLogarithmsWithOneArgument')) node = reduceLogarithmsWithOneArgument(node)
	if (isLogLike(node) && options.has('reduceLogarithmsWithBaseArgument')) node = reduceLogarithmsWithBaseArgument(node)
	return node
}
