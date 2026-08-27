import { type Sqrt, type Root, Integer, root } from '../../../../construction'

import { isSqrt } from '../../../structural'

import { defineRule } from '../ruleDefinition'

import { rewriteSquareRootsAsSqrts } from './rewriteSquareRootsAsSqrts'

function transform(node: Sqrt): Sqrt | Root {
	return isSqrt(node) ? root(node.radicand, Integer.two) : node
}

export const rewriteSqrtsAsSquareRoots = defineRule({
	name: 'rewriteSqrtsAsSquareRoots',
	appliesTo: isSqrt,
	transform,
	conflictsWith: [rewriteSquareRootsAsSqrts],
})
