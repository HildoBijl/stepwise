import { isRoot, isTwo } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type Root, type Sqrt, sqrt } from '../../../../construction'

function transform(node: Root): Root | Sqrt {
	return isRoot(node) && isTwo(node.degree) ? sqrt(node.radicand) : node
}

export const turnDegreeTwoRootsIntoSqrts = defineRule({
	appliesTo: isRoot,
	transform,
})
