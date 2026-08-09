import { type Power, type RootLike, power } from '../../../../construction'

import { isPower, isRootLike } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Power): Power | RootLike {
	return isRootLike(node.base) ? node.base.recreateWith(power(node.base.radicand, node.exponent)) : node
}

export const pullExponentsIntoRoots = defineRule({
	name: 'pullExponentsIntoRoots',
	appliesTo: isPower,
	transform,
})
