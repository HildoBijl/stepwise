import { type ExpressionNode } from '../../../../construction'

import { isSum, isProduct, isFraction } from '../../../structural'

import { type SimplificationContext } from '../../simplificationOptions'

import { reduceFractionsWithZeroNumerator } from './reduceFractionsWithZeroNumerator'
import { reduceFractionsWithOneDenominator } from './reduceFractionsWithOneDenominator'
import { mergeFractionProducts } from './mergeFractionProducts'
import { flattenFractions } from './flattenFractions'
import { mergeNumericFractionSums } from './mergeNumericFractionSums'
import { mergeFractionSums } from './mergeFractionSums'
import { splitFractions } from './splitFractions'
import { mergeFractionMinuses } from './mergeFractionMinuses'
import { mergeFractionSumMinuses } from './mergeFractionSumMinuses'
import { normalizeFractionMinuses } from './normalizeFractionMinuses'
import { mergeFractionNumbers } from './mergeFractionNumbers'
import { cancelFractionFactors } from './cancelFractionFactors'
import { mergeFractionFactors } from './mergeFractionFactors'
import { applyPolynomialCancellation } from './applyPolynomialCancellation'

export function simplifyFractions(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	const options = context.simplificationOptions
	if (isFraction(node) && options.has('reduceFractionsWithZeroNumerator')) node = reduceFractionsWithZeroNumerator(node)
	if (isFraction(node) && options.has('reduceFractionsWithOneDenominator')) node = reduceFractionsWithOneDenominator(node)
	if (isProduct(node) && options.has('mergeFractionProducts')) node = mergeFractionProducts(node)
	if (isFraction(node) && options.has('flattenFractions')) node = flattenFractions(node)
	if (isSum(node) && options.has('mergeNumericFractionSums') && !options.has('mergeFractionSums')) node = mergeNumericFractionSums(node)
	if (isSum(node) && options.has('mergeFractionSums')) node = mergeFractionSums(node)
	if (isFraction(node) && options.has('splitFractions')) node = splitFractions(node)
	if (isFraction(node) && options.has('mergeFractionMinuses')) node = mergeFractionMinuses(node)
	if (isFraction(node) && options.has('mergeFractionSumMinuses')) node = mergeFractionSumMinuses(node)
	if (isFraction(node) && options.has('mergeFractionNumbers')) node = mergeFractionNumbers(node)
	if (isFraction(node) && options.has('cancelFractionFactors')) node = cancelFractionFactors(node)
	if (isFraction(node) && options.has('mergeFractionFactors')) node = mergeFractionFactors(node)
	if (isFraction(node) && options.has('applyPolynomialCancellation')) node = applyPolynomialCancellation(node, context)
	if (isFraction(node) && options.has('normalizeFractionMinuses')) node = normalizeFractionMinuses(node)
	return node
}
