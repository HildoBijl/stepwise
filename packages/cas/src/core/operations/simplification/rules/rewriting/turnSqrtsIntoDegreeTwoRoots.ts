import { type Sqrt, type Root, Integer, root } from '../../../../construction'

import { isSqrt } from '../../../structural'

import { defineRule } from '../ruleDefinition'

import { turnDegreeTwoRootsIntoSqrts } from './turnDegreeTwoRootsIntoSqrts'

function transform(node: Sqrt): Sqrt | Root {
	return isSqrt(node) ? root(node.radicand, Integer.two) : node
}

export const turnSqrtsIntoDegreeTwoRoots = defineRule({
	name: 'turnSqrtsIntoDegreeTwoRoots',
	appliesTo: isSqrt,
	transform,
	conflictsWith: [turnDegreeTwoRootsIntoSqrts],
})
