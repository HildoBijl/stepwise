import { isSqrt } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type Sqrt, type Root, Integer, root } from '../../../../construction'

function transform(node: Sqrt): Sqrt | Root {
	return isSqrt(node) ? root(node.radicand, Integer.two) : node
}

export const turnSqrtsIntoDegreeTwoRoots = defineRule({
	appliesTo: isSqrt,
	transform,
})
