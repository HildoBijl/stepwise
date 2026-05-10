import { type ExpressionNode } from '../../../../construction'

import { isSum } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { removeTrivialSums } from './removeTrivialSums'
import { flattenSums } from './flattenSums'
import { removePlusZeroFromSums } from './removePlusZeroFromSums'
import { mergeSumNumbers } from './mergeSumNumbers'
import { cancelSumTerms } from './cancelSumTerms'
import { groupSumTerms } from './groupSumTerms'
import { pullOutCommonSumNumbers } from './pullOutCommonSumNumbers'
import { pullOutCommonSumFactors } from './pullOutCommonSumFactors'
import { sortSums } from './sortSums'

export function simplifySums(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	// Apply basic sum simplifications.
	if (isSum(node) && context.simplificationOptions.flattenSums) node = flattenSums(node)
	if (isSum(node) && context.simplificationOptions.removePlusZeroFromSums) node = removePlusZeroFromSums(node)
	if (isSum(node) && context.simplificationOptions.mergeSumNumbers) node = mergeSumNumbers(node)
	if (isSum(node) && context.simplificationOptions.cancelSumTerms) node = cancelSumTerms(node)
	if (isSum(node) && context.simplificationOptions.groupSumTerms) node = groupSumTerms(node)

	// Try pulling out factors.
	if (isSum(node) && context.simplificationOptions.pullOutCommonSumNumbers) node = pullOutCommonSumNumbers(node)
	if (isSum(node) && context.simplificationOptions.pullOutCommonSumFactors) node = pullOutCommonSumFactors(node)

	// At the end, clean up and sort.
	if (isSum(node) && context.simplificationOptions.removeTrivialSums) node = removeTrivialSums(node)
	if (isSum(node) && context.simplificationOptions.sortSums) node = sortSums(node)
	return node
}
