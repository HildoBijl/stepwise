import { isProduct, isRootLike, equalNodes } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Product, type RootLike, product } from '../../../../construction'

function transform(node: Product): ExpressionNode {
	const [rootFactors, otherFactors] = splitArray(node.factors, isRootLike)
	const groups: { root: RootLike, radicands: ExpressionNode[] }[] = []
	for (const root of rootFactors) {
		const group = groups.find(group => equalNodes(group.root.degree, root.degree) && group.root.constructor === root.constructor)
		if (group) group.radicands.push(root.radicand)
		else groups.push({ root, radicands: [root.radicand] })
	}
	if (groups.length === rootFactors.length) return node
	return product(...otherFactors, ...groups.map(group => group.radicands.length === 1 ? group.root : group.root.recreateWith(product(...group.radicands))))
}

export const mergeProductsOfRoots = defineRule({
	appliesTo: (node, context): node is Parameters<typeof transform>[0] => isProduct(node) && !context.simplificationOptions.has('expandRootsOfProducts'),
	transform,
})
