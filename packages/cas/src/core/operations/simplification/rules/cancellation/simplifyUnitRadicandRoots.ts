import { type ExpressionNode, type RootFunction, Integer } from '../../../../construction/index.ts'

import { isRootFunction, isOne } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: RootFunction): ExpressionNode {
	return isOne(node.radicand) ? Integer.one : node
}

export const simplifyUnitRadicandRoots = defineRule({
	name: 'simplifyUnitRadicandRoots',
	appliesTo: isRootFunction,
	transform,
})
