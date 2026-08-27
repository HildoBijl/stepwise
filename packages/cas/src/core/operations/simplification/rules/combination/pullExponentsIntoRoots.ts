import { type Power, type RootFunction, power } from '../../../../construction'

import { isPower, isRootFunction } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Power): Power | RootFunction {
	return isRootFunction(node.base) ? node.base.recreateWith(power(node.base.radicand, node.exponent)) : node
}

export const pullExponentsIntoRoots = defineRule({
	name: 'pullExponentsIntoRoots',
	appliesTo: isPower,
	transform,
})
