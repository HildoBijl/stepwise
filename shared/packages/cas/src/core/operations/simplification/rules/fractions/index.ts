import { reduceFractionsWithZeroNumerator } from './reduceFractionsWithZeroNumerator'
import { reduceFractionsWithOneDenominator } from './reduceFractionsWithOneDenominator'
import { mergeFractionProducts } from './mergeFractionProducts'
import { flattenFractions } from './flattenFractions'
import { mergeNumericFractionSums } from './mergeNumericFractionSums'
import { mergeFractionSums } from './mergeFractionSums'
import { splitFractions } from './splitFractions'
import { mergeFractionMinuses } from './mergeFractionMinuses'
import { mergeFractionSumMinuses } from './mergeFractionSumMinuses'
import { mergeFractionNumbers } from './mergeFractionNumbers'
import { cancelFractionFactors } from './cancelFractionFactors'
import { mergeFractionFactors } from './mergeFractionFactors'
import { applyPolynomialCancellation } from './applyPolynomialCancellation'
import { normalizeFractionMinuses } from './normalizeFractionMinuses'

export const fractionRules = {
	reduceFractionsWithZeroNumerator,
	reduceFractionsWithOneDenominator,
	mergeFractionProducts,
	flattenFractions,
	mergeNumericFractionSums,
	mergeFractionSums,
	splitFractions,
	mergeFractionMinuses,
	mergeFractionSumMinuses,
	mergeFractionNumbers,
	cancelFractionFactors,
	mergeFractionFactors,
	applyPolynomialCancellation,
	normalizeFractionMinuses,
}
