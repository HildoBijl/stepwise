import { type ExpressionNode } from '../../../../construction'

import { isSum, isProduct } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { flattenProducts } from './flattenProducts'
import { mergeProductMinuses } from './mergeProductMinuses'
import { mergeProductPlusMinuses } from './mergeProductPlusMinuses'
import { reduceProductsWithZero } from './reduceProductsWithZero'
import { removeOnesFromProducts } from './removeOnesFromProducts'
import { mergeProductNumbers } from './mergeProductNumbers'
import { mergeProductFactors } from './mergeProductFactors'
import { expandProductsOfSums } from './expandProductsOfSums'
import { sortProducts } from './sortProducts'

export function simplifyProducts(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isProduct(node) && options.has('flattenProducts')) node = flattenProducts(node)
	if (isProduct(node) && options.has('mergeProductMinuses')) node = mergeProductMinuses(node)
	if (isProduct(node) && options.has('mergeProductPlusMinuses')) node = mergeProductPlusMinuses(node)
	if (isProduct(node) && options.has('reduceProductsWithZero')) node = reduceProductsWithZero(node)
	if (isProduct(node) && options.has('removeOnesFromProducts')) node = removeOnesFromProducts(node)
	if (isProduct(node) && options.has('mergeProductNumbers')) node = mergeProductNumbers(node)
	if (isProduct(node) && options.has('mergeProductFactors')) node = mergeProductFactors(node)
	if (isProduct(node) && (options.has('expandProductsOfSums') || (options.has('expandProductsOfSumsWithinSums') && context.parents.some(isSum)))) node = expandProductsOfSums(node)
	if (isProduct(node) && options.has('sortProducts')) node = sortProducts(node)
	return node
}
