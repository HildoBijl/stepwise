import { type ExpressionNode } from '../../../../construction'

import { isSum, isProduct, isFraction } from '../../../structural'

import { type SimplificationContext } from '../../definitions'

import { reduceFractionsWithZeroNumerator } from './reduceFractionsWithZeroNumerator'
import { reduceFractionsWithOneDenominator } from './reduceFractionsWithOneDenominator'
import { mergeFractionProducts } from './mergeFractionProducts'
import { flattenFractions } from './flattenFractions'
import { mergeFractionSums } from './mergeFractionSums'
import { splitFractions } from './splitFractions'
import { mergeFractionMinuses } from './mergeFractionMinuses'
import { normalizeFractionMinuses } from './normalizeFractionMinuses'
import { mergeFractionNumbers } from './mergeFractionNumbers'
import { cancelFractionFactors } from './cancelFractionFactors'
import { mergeFractionFactors } from './mergeFractionFactors'
// import { applyPolynomialCancellation } from './applyPolynomialCancellation'

export function simplifyFractions(node: ExpressionNode, context: SimplificationContext): ExpressionNode {
	if (isFraction(node) && context.simplificationOptions.reduceFractionsWithZeroNumerator) node = reduceFractionsWithZeroNumerator(node)
	if (isFraction(node) && context.simplificationOptions.reduceFractionsWithOneDenominator) node = reduceFractionsWithOneDenominator(node)
	if (isProduct(node) && context.simplificationOptions.mergeFractionProducts) node = mergeFractionProducts(node)
	if (isFraction(node) && context.simplificationOptions.flattenFractions) node = flattenFractions(node)
	if (isSum(node) && context.simplificationOptions.mergeFractionSums) node = mergeFractionSums(node)
	if (isFraction(node) && context.simplificationOptions.splitFractions) node = splitFractions(node)
	if (isFraction(node) && context.simplificationOptions.mergeFractionMinuses) node = mergeFractionMinuses(node)
	if (isFraction(node) && context.simplificationOptions.mergeFractionNumbers) node = mergeFractionNumbers(node)
	if (isFraction(node) && context.simplificationOptions.cancelFractionFactors) node = cancelFractionFactors(node)
	if (isFraction(node) && context.simplificationOptions.mergeFractionFactors) node = mergeFractionFactors(node)
	// if (isFraction(node) && context.simplificationOptions.applyPolynomialCancellation) node = applyPolynomialCancellation(node)
	if (isFraction(node) && context.simplificationOptions.normalizeFractionMinuses) node = normalizeFractionMinuses(node)
	return node
}
