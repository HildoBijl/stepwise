import { type ExpressionNode, type RootLike, fraction, power } from '../../../../construction'

import { isRootLike } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootLike): ExpressionNode {
	return power(node.radicand, fraction(1, node.degree))
}

export const turnRootsIntoFractionExponents = defineRule({
	name: 'turnRootsIntoFractionExponents',
	appliesTo: isRootLike,
	transform,
})
