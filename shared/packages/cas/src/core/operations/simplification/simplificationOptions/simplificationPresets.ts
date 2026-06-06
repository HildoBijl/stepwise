import { difference } from '@step-wise/utils'

import { type SimplificationOption } from './types'
import { adjustSimplificationOptions } from './utils'

export const flatten = new Set<SimplificationOption>([
	// Excess brackets
	'flattenSums',
	'flattenProducts',
])

export const removeTrivial = new Set<SimplificationOption>([
	...flatten,

	// Structure
	'turnFloatsIntoIntegers',
	'turnDegreeTwoRootsIntoSqrts',

	// Excess minuses
	'removeSignsFromZeros',
	'removeDoubleNegatives',
	'mergeProductMinuses',

	// Excess plus-minuses.
	'removeDoubleSigns',
	'mergeProductPlusMinuses',

	// Excess zeros
	'removeZeroesFromSums',
	'reduceProductsWithZero',
	'reduceFractionsWithZeroNumerator',
	'reducePowersWithZeroExponent',
	'reducePowersWithZeroBase',
	'reduceRootsWithZeroRadicand',
	'reduceLogarithmsWithOneArgument',

	// Excess ones
	'removeOnesFromProducts',
	'reduceFractionsWithOneDenominator',
	'removeOneExponentsFromPowers',
	'reducePowersWithOneBase',
	'reduceRootsWithOneRadicand',
	'reduceRootsWithOneDegree',
	'reduceLogarithmsWithBaseArgument',
])

export const mergeNumbers = new Set<SimplificationOption>([
	...removeTrivial,
	'mergeSumNumbers',
	'mergeProductNumbers',
	'mergeFractionMinuses',
	'mergeFractionNumbers',
	'reduceFractionsWithOneDenominator',
	'mergePowerMinuses',
	'reduceNumberPowers',
	'reduceNumberRoots',
])

export const cancel = new Set<SimplificationOption>([
	...mergeNumbers,
	'expandMinusSums',
	'mergeFractionSumMinuses',
	'cancelSumTerms',
	'cancelFractionFactors',
	'reduceCanceledRoots',
])

export const combine = new Set<SimplificationOption>([
	...cancel,
	'groupSumTerms',
	'mergeProductFactors',
	'mergeFractionProducts',
	'flattenFractions',
	'mergeFractionFactors',
	'mergeNumericFractionSums',
	'convertNegativePowers',
	'removePowersWithinPowers',
	'mergeProductsOfRoots',
	'pullExponentsIntoRoots',
	'reducePowersInRoots',
])

export const expand = new Set<SimplificationOption>([
	...combine,
	'expandPlusMinusSums',
	'expandProductsOfSums',
	'mergeFractionSums',
	'expandPowersOfProducts',
	'expandPowersOfFractions',
	'expandPowersOfSums',
	'mergeProductsWithRoots',
])

export const sort = new Set<SimplificationOption>([
	'sortSums',
	'sortProducts',
])

export const normalizationRequirements = new Set<SimplificationOption>([
	...expand,
	...sort,
])

export const normalize = new Set<SimplificationOption>([
	...normalizationRequirements,
	'normalizeFractionMinuses',
	'applyPolynomialCancellation',
	'turnRootsIntoFractionExponents',
])

export const factorize = new Set<SimplificationOption>([
	...removeTrivial,
	'mergeSumNumbers',
	'cancelSumTerms',
	'expandMinusSums',
	'reducePowersWithZeroExponent',
	'removeOnesFromProducts',
	'factorizeIntegers',
	'mergeProductFactors',
	'pullOutCommonSumNumbers',
	'pullOutCommonSumFactors',
	'expandRootsOfProducts',
	'pullFactorsOutOfRoots',
])

export const format = difference(new Set<SimplificationOption>([
	...combine,
	...sort,
	'expandMinusSums',
	'mergeProductFactors',
	'cancelSumTerms',
	'pullOutCommonSumNumbers',
	'pullOutCommonSumFactors',
	'turnFractionExponentsIntoRoots',
	'pullFactorsOutOfRoots',
	// 'preventRootDenominators',
]), new Set<SimplificationOption>(['expandProductsOfSums', 'mergeFractionFactors', 'mergeProductFactors', 'mergeProductsOfRoots', 'mergeProductsWithRoots', 'reducePowersInRoots']))
