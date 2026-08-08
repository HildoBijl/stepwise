import { isRootLike } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type RootLike, fraction, power } from '../../../../construction'

function transform(node: RootLike): ExpressionNode {
	return power(node.radicand, fraction(1, node.degree))
}

export const turnRootsIntoFractionExponents = defineRule({
	appliesTo: isRootLike,
	transform,
})
