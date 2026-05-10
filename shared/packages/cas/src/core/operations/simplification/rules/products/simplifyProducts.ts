import { type ExpressionNode } from '../../../../construction'

import { isProduct } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { flattenProducts } from './flattenProducts'
import { mergeProductMinuses } from './mergeProductMinuses'
import { mergeProductPlusMinuses } from './mergeProductPlusMinuses'
import { removeTimesZeroFromProduct } from './removeTimesZeroFromProduct'
import { removeTimesOneFromProducts } from './removeTimesOneFromProducts'
import { mergeProductNumbers } from './mergeProductNumbers'
import { mergeProductFactors } from './mergeProductFactors'
import { expandProductsOfSums } from './expandProductsOfSums'
import { sortProducts } from './sortProducts'

export function simplifyProducts(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isProduct(node) && context.simplificationOptions.flattenProducts) node = flattenProducts(node)
	if (isProduct(node) && context.simplificationOptions.mergeProductMinuses) node = mergeProductMinuses(node)
	if (isProduct(node) && context.simplificationOptions.mergeProductPlusMinuses) node = mergeProductPlusMinuses(node)
	if (isProduct(node) && context.simplificationOptions.removeTimesZeroFromProduct) node = removeTimesZeroFromProduct(node)
	if (isProduct(node) && context.simplificationOptions.removeTimesOneFromProducts) node = removeTimesOneFromProducts(node)
	if (isProduct(node) && context.simplificationOptions.mergeProductNumbers) node = mergeProductNumbers(node)
	if (isProduct(node) && context.simplificationOptions.mergeProductFactors) node = mergeProductFactors(node)
	if (isProduct(node) && context.simplificationOptions.expandProductsOfSums) node = expandProductsOfSums(node)
	if (isProduct(node) && context.simplificationOptions.sortProducts) node = sortProducts(node)
	return node
}
