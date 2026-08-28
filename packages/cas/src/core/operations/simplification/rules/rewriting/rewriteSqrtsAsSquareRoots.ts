import { type Sqrt, type Root, Integer, root } from '../../../../construction/index.ts'

import { isSqrt } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

import { rewriteSquareRootsAsSqrts } from './rewriteSquareRootsAsSqrts.ts'

function transform(node: Sqrt): Sqrt | Root {
	return isSqrt(node) ? root(node.radicand, Integer.two) : node
}

export const rewriteSqrtsAsSquareRoots = defineRule({
	name: 'rewriteSqrtsAsSquareRoots',
	appliesTo: isSqrt,
	transform,
	conflictsWith: [rewriteSquareRootsAsSqrts],
})
