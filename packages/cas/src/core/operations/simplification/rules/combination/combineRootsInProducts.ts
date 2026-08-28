import { partition } from '@step-wise/js-utils'

import { type ExpressionNode, type Product, type RootFunction, product } from '../../../../construction/index.ts'

import { isProduct, isRootFunction, areNodesEqual } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Product): ExpressionNode {
	const [rootFactors, otherFactors] = partition(node.factors, isRootFunction)
	const groups: { root: RootFunction, radicands: ExpressionNode[] }[] = []
	for (const root of rootFactors) {
		const group = groups.find(group => areNodesEqual(group.root.degree, root.degree) && group.root.constructor === root.constructor)
		if (group) group.radicands.push(root.radicand)
		else groups.push({ root, radicands: [root.radicand] })
	}
	if (groups.length === rootFactors.length) return node
	return product(...otherFactors, ...groups.map(group => group.radicands.length === 1 ? group.root : group.root.recreateWith(product(...group.radicands))))
}

export const combineRootsInProducts = defineRule({
	name: 'combineRootsInProducts',
	appliesTo: isProduct,
	transform,
})
