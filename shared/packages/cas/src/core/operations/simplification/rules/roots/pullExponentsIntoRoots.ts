import { isPower, isRootLike } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type Power, type RootLike, power } from '../../../../construction'

function transform(node: Power): Power | RootLike {
	return isRootLike(node.base) ? node.base.recreateWith(power(node.base.radicand, node.exponent)) : node
}

export const pullExponentsIntoRoots = defineRule({
	appliesTo: isPower,
	transform,
})
