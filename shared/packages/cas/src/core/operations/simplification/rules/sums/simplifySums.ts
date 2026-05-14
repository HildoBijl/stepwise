import { type ExpressionNode } from '../../../../construction'

import { isNegativeSign, isPlusMinusSign, isSum } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { flattenSums } from './flattenSums'
import { removePlusZeroFromSums } from './removePlusZeroFromSums'
import { mergeSumNumbers } from './mergeSumNumbers'
import { cancelSumTerms } from './cancelSumTerms'
import { groupSumTerms } from './groupSumTerms'
import { expandMinusSums } from './expandMinusSums'
import { expandPlusMinusSums } from './expandPlusMinusSums'
import { pullOutCommonSumNumbers } from './pullOutCommonSumNumbers'
import { pullOutCommonSumFactors } from './pullOutCommonSumFactors'
import { sortSums } from './sortSums'

export function simplifySums(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isSum(node) && options.has('flattenSums')) node = flattenSums(node)
	if (isSum(node) && options.has('removePlusZeroFromSums')) node = removePlusZeroFromSums(node)
	if (isSum(node) && options.has('mergeSumNumbers')) node = mergeSumNumbers(node)
	if (isSum(node) && options.has('cancelSumTerms')) node = cancelSumTerms(node)
	if (isSum(node) && options.has('groupSumTerms')) node = groupSumTerms(node)
	if (isNegativeSign(node) && options.has('expandMinusSums')) node = expandMinusSums(node)
	if (isPlusMinusSign(node) && options.has('expandPlusMinusSums')) node = expandPlusMinusSums(node)
	if (isSum(node) && options.has('pullOutCommonSumNumbers')) node = pullOutCommonSumNumbers(node)
	if (isSum(node) && options.has('pullOutCommonSumFactors')) node = pullOutCommonSumFactors(node)
	if (isSum(node) && options.has('sortSums')) node = sortSums(node)
	return node
}
