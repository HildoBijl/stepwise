import { type ExpressionNode, type RootFunction } from '../../../../construction/index.ts'

import { isRootFunction, isOne } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: RootFunction): ExpressionNode {
	return isOne(node.degree) ? node.radicand : node
}

export const simplifyUnitDegreeRoots = defineRule({
	name: 'simplifyUnitDegreeRoots',
	appliesTo: isRootFunction,
	transform,
})
