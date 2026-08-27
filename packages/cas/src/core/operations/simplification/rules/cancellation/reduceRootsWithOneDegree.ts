import { type ExpressionNode, type RootFunction } from '../../../../construction'

import { isRootFunction, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootFunction): ExpressionNode {
	return isOne(node.degree) ? node.radicand : node
}

export const reduceRootsWithOneDegree = defineRule({
	name: 'reduceRootsWithOneDegree',
	appliesTo: isRootFunction,
	transform,
})
