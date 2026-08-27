import { type ExpressionNode, type RootFunction, Integer } from '../../../../construction'

import { isRootFunction, isOne } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: RootFunction): ExpressionNode {
	return isOne(node.radicand) ? Integer.one : node
}

export const simplifyUnitRadicandRoots = defineRule({
	name: 'simplifyUnitRadicandRoots',
	appliesTo: isRootFunction,
	transform,
})
