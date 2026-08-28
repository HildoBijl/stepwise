import { type Power, type RootFunction, power } from '../../../../construction/index.ts'

import { isPower, isRootFunction } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Power): Power | RootFunction {
	return isRootFunction(node.base) ? node.base.recreateWith(power(node.base.radicand, node.exponent)) : node
}

export const moveExponentsIntoRoots = defineRule({
	name: 'moveExponentsIntoRoots',
	appliesTo: isPower,
	transform,
})
