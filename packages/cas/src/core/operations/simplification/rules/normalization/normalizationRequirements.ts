import { structuralRules } from '../structural'
import { numericRules } from '../numeric'
import { cancellationRules } from '../cancellation'
import { rewritingRules } from '../rewriting'
import { combinationRules } from '../combination'
import { expansionRules } from '../expansion'

import { sortSums } from './sortSums'
import { sortProducts } from './sortProducts'

const { flattenSums, flattenProducts } = structuralRules
const { convertIntegerFloatsToIntegers, combineNumbersInSums, combineNumbersInProducts, combineNumbersInFractions, evaluateNumericPowers, evaluateNumericRoots, combineMinusSignsInProducts, removeSignsFromZero, removeDoubleNegatives, removeDoubleSigns, combinePlusMinusSignsInProducts, combineMinusSignsInFractions, combineMinusSignsInPowers, factorMinusSignsOutOfFractionSums } = numericRules
const { rewriteSquareRootsAsSqrts, rewriteNegativePowersAsFractions, flattenFractions, flattenNestedPowers } = rewritingRules
const { removeZeroesFromSums, simplifyZeroProducts, simplifyZeroNumeratorFractions, simplifyZeroExponentPowers, simplifyZeroBasePowers, simplifyZeroRadicandRoots, simplifyUnitArgumentLogarithms, removeOnesFromProducts, simplifyUnitDenominatorFractions, simplifyUnitExponentPowers, simplifyUnitBasePowers, simplifyUnitRadicandRoots, simplifyUnitDegreeRoots, simplifyBaseArgumentLogarithms, cancelSumTerms, cancelFractionFactors, cancelMatchingRootsAndPowers, reduceRootPowerExponents } = cancellationRules
const { combineLikeTerms, combineLikeFactors, combineProductFractions, combineNumericFractionsInSums, combineSumFractions, combineFractionFactors, combineRootsInProducts, combineProductsWithRoots, moveExponentsIntoRoots } = combinationRules
const { expandMinusSums, expandPlusMinusSums, expandProductsOfSums, expandPowersOfProducts, expandPowersOfFractions, expandPowersOfSums } = expansionRules

export const normalizationRequirementRules = [
	flattenSums,
	flattenProducts,
	combineMinusSignsInProducts,
	convertIntegerFloatsToIntegers,
	rewriteSquareRootsAsSqrts,
	removeSignsFromZero,
	removeDoubleNegatives,
	removeDoubleSigns,
	combinePlusMinusSignsInProducts,
	removeZeroesFromSums,
	simplifyZeroProducts,
	simplifyZeroNumeratorFractions,
	simplifyZeroExponentPowers,
	simplifyZeroBasePowers,
	simplifyZeroRadicandRoots,
	simplifyUnitArgumentLogarithms,
	removeOnesFromProducts,
	simplifyUnitDenominatorFractions,
	simplifyUnitExponentPowers,
	simplifyUnitBasePowers,
	simplifyUnitRadicandRoots,
	simplifyUnitDegreeRoots,
	simplifyBaseArgumentLogarithms,
	combineNumbersInSums,
	combineNumbersInProducts,
	combineMinusSignsInFractions,
	combineNumbersInFractions,
	combineMinusSignsInPowers,
	evaluateNumericPowers,
	evaluateNumericRoots,
	expandMinusSums,
	factorMinusSignsOutOfFractionSums,
	cancelSumTerms,
	cancelFractionFactors,
	cancelMatchingRootsAndPowers,
	combineLikeTerms,
	combineLikeFactors,
	combineProductFractions,
	flattenFractions,
	combineFractionFactors,
	combineNumericFractionsInSums,
	rewriteNegativePowersAsFractions,
	flattenNestedPowers,
	combineRootsInProducts,
	moveExponentsIntoRoots,
	reduceRootPowerExponents,
	expandPlusMinusSums,
	expandProductsOfSums,
	combineSumFractions,
	expandPowersOfProducts,
	expandPowersOfFractions,
	expandPowersOfSums,
	combineProductsWithRoots,
	sortSums,
	sortProducts,
] as const
