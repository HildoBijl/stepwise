import { type Root, type Sqrt, sqrt } from '../../../../construction/index.ts'

import { isRoot, isTwo } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Root): Root | Sqrt {
	return isRoot(node) && isTwo(node.degree) ? sqrt(node.radicand) : node
}

export const rewriteSquareRootsAsSqrts = defineRule({
	name: 'rewriteSquareRootsAsSqrts',
	appliesTo: isRoot,
	transform,
})
