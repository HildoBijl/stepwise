import { type ExpressionNode } from '../../../../construction'

import { isSum, isProduct, isFraction } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { removeZeroNumeratorFromFractions } from './removeZeroNumeratorFromFractions'
import { removeOneDenominatorFromFractions } from './removeOneDenominatorFromFractions'
import { mergeFractionProducts } from './mergeFractionProducts'
import { flattenFractions } from './flattenFractions'
import { mergeFractionSums } from './mergeFractionSums'
import { splitFractions } from './splitFractions'
import { cancelFractionMinuses } from './cancelFractionMinuses'
import { normalizeFractionMinuses } from './normalizeFractionMinuses'
import { cancelFractionNumbers } from './cancelFractionNumbers'
import { cancelFractionFactors } from './cancelFractionFactors'
import { mergeFractionFactors } from './mergeFractionFactors'
// import { applyPolynomialCancellation } from './applyPolynomialCancellation'

export function simplifyFractions(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isFraction(node) && context.simplificationOptions.removeZeroNumeratorFromFractions) node = removeZeroNumeratorFromFractions(node)
	if (isFraction(node) && context.simplificationOptions.removeOneDenominatorFromFractions) node = removeOneDenominatorFromFractions(node)
	if (isProduct(node) && context.simplificationOptions.mergeFractionProducts) node = mergeFractionProducts(node)
	if (isFraction(node) && context.simplificationOptions.flattenFractions) node = flattenFractions(node)
	if (isSum(node) && context.simplificationOptions.mergeFractionSums) node = mergeFractionSums(node)
	if (isFraction(node) && context.simplificationOptions.splitFractions) node = splitFractions(node)
	if (isFraction(node) && context.simplificationOptions.cancelFractionMinuses) node = cancelFractionMinuses(node)
	if (isFraction(node) && context.simplificationOptions.cancelFractionNumbers) node = cancelFractionNumbers(node)
	if (isFraction(node) && context.simplificationOptions.cancelFractionFactors) node = cancelFractionFactors(node)
	if (isFraction(node) && context.simplificationOptions.mergeFractionFactors) node = mergeFractionFactors(node)
	// if (isFraction(node) && context.simplificationOptions.applyPolynomialCancellation) node = applyPolynomialCancellation(node)
	if (isFraction(node) && context.simplificationOptions.normalizeFractionMinuses) node = normalizeFractionMinuses(node)
	return node
}
