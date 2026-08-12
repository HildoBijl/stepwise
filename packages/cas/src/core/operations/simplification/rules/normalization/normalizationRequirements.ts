import { structuralRules } from '../structural'
import { numericRules } from '../numeric'
import { cancellationRules } from '../cancellation'
import { rewritingRules } from '../rewriting'
import { combinationRules } from '../combination'
import { expansionRules } from '../expansion'

import { sortSums } from './sortSums'
import { sortProducts } from './sortProducts'

const { flattenSums, flattenProducts } = structuralRules
const { turnFloatsIntoIntegers, mergeSumNumbers, mergeProductNumbers, mergeFractionNumbers, reduceNumberPowers, reduceNumberRoots, mergeProductMinuses, removeSignsFromZeros, removeDoubleNegatives, removeDoubleSigns, mergeProductPlusMinuses, mergeFractionMinuses, mergePowerMinuses, mergeFractionSumMinuses } = numericRules
const { turnDegreeTwoRootsIntoSqrts, convertNegativePowers, flattenFractions, removePowersWithinPowers } = rewritingRules
const { removeZeroesFromSums, reduceProductsWithZero, reduceFractionsWithZeroNumerator, reducePowersWithZeroExponent, reducePowersWithZeroBase, reduceRootsWithZeroRadicand, reduceLogarithmsWithOneArgument, removeOnesFromProducts, reduceFractionsWithOneDenominator, removeOneExponentsFromPowers, reducePowersWithOneBase, reduceRootsWithOneRadicand, reduceRootsWithOneDegree, reduceLogarithmsWithBaseArgument, cancelSumTerms, cancelFractionFactors, reduceCanceledRoots, reducePowersInRoots } = cancellationRules
const { groupSumTerms, mergeProductFactors, mergeFractionProducts, mergeNumericFractionSums, mergeFractionSums, mergeFractionFactors, mergeProductsOfRoots, mergeProductsWithRoots, pullExponentsIntoRoots } = combinationRules
const { expandMinusSums, expandPlusMinusSums, expandProductsOfSums, expandPowersOfProducts, expandPowersOfFractions, expandPowersOfSums } = expansionRules

export const normalizationRequirementRules = [
	flattenSums,
	flattenProducts,
	mergeProductMinuses,
	turnFloatsIntoIntegers,
	turnDegreeTwoRootsIntoSqrts,
	removeSignsFromZeros,
	removeDoubleNegatives,
	removeDoubleSigns,
	mergeProductPlusMinuses,
	removeZeroesFromSums,
	reduceProductsWithZero,
	reduceFractionsWithZeroNumerator,
	reducePowersWithZeroExponent,
	reducePowersWithZeroBase,
	reduceRootsWithZeroRadicand,
	reduceLogarithmsWithOneArgument,
	removeOnesFromProducts,
	reduceFractionsWithOneDenominator,
	removeOneExponentsFromPowers,
	reducePowersWithOneBase,
	reduceRootsWithOneRadicand,
	reduceRootsWithOneDegree,
	reduceLogarithmsWithBaseArgument,
	mergeSumNumbers,
	mergeProductNumbers,
	mergeFractionMinuses,
	mergeFractionNumbers,
	mergePowerMinuses,
	reduceNumberPowers,
	reduceNumberRoots,
	expandMinusSums,
	mergeFractionSumMinuses,
	cancelSumTerms,
	cancelFractionFactors,
	reduceCanceledRoots,
	groupSumTerms,
	mergeProductFactors,
	mergeFractionProducts,
	flattenFractions,
	mergeFractionFactors,
	mergeNumericFractionSums,
	convertNegativePowers,
	removePowersWithinPowers,
	mergeProductsOfRoots,
	pullExponentsIntoRoots,
	reducePowersInRoots,
	expandPlusMinusSums,
	expandProductsOfSums,
	mergeFractionSums,
	expandPowersOfProducts,
	expandPowersOfFractions,
	expandPowersOfSums,
	mergeProductsWithRoots,
	sortSums,
	sortProducts,
] as const
