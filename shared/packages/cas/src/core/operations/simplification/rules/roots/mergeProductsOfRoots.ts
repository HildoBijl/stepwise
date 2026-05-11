import { splitArray } from '@step-wise/utils'

import { type ExpressionNode, type Product, product } from '../../../../construction'

import { equalNodes } from '../../../structural'

import { type RootLike, isRootLike, recreateRootLike } from '../utils'

export function mergeProductsOfRoots(node: Product): ExpressionNode {
	const [rootFactors, otherFactors] = splitArray(node.factors, isRootLike)
	const groups: { root: RootLike, arguments: ExpressionNode[] }[] = []
	for (const root of rootFactors) {
		const group = groups.find(group => equalNodes(group.root.base, root.base, { allowOrderChanges: true }) && group.root.constructor === root.constructor)
		if (group) group.arguments.push(root.argument)
		else groups.push({ root, arguments: [root.argument] })
	}
	if (groups.length === rootFactors.length) return node
	return product(...otherFactors, ...groups.map(group => group.arguments.length === 1 ? group.root : recreateRootLike(group.root, product(...group.arguments))))
}
