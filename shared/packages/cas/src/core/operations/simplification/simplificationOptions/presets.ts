import { union, difference } from '@step-wise/utils'

import { type SimplificationOption } from './types'
import { getSimplificationOptionsFromSet } from './utils'

export const noSimplify = new Set<SimplificationOption>()

export const removeTrivial = new Set<SimplificationOption>([
	// Structure
	'turnFloatsIntoIntegers',
	'turnBaseTwoRootsIntoSqrts',

	// Excess brackets
	'flattenSums',
	'flattenProducts',

	// Excess minuses
	'mergeProductMinuses',
	'mergeFractionMinuses',
	'removeDoubleNegatives',
	'removeMinusFromZero',
	'mergeFractionMinuses',

	// Excess plus-minuses.
	'removeDoublePlusMinusSigns',
	'mergeProductPlusMinuses',

	// Excess zeros
	'removePlusZeroFromSums',
	'reduceProductsWithZero',
	'reduceFractionsWithZeroNumerator',
	'reducePowersWithZeroExponent',
	'reducePowersWithZeroBase',
	'reduceRootsWithZeroArgument',

	// Excess ones
	'removeTimesOneFromProducts',
	'reduceFractionsWithOneDenominator',
	'removeOneExponentFromPowers',
	'reducePowersWithOneBase',
	'reduceRootsWithOneArgument',
])
export const removeTrivialOptions = getSimplificationOptionsFromSet(removeTrivial)

export const mergeNumbers = new Set<SimplificationOption>([
	'mergeSumNumbers',
	'mergeProductNumbers',
	'mergeFractionNumbers',
	'reduceFractionsWithOneDenominator',
	'mergePowerNumbers',
	'reduceIntegerRoots',
])

export const applyCancellations = new Set<SimplificationOption>([
	...removeTrivial,
	...mergeNumbers,
	'cancelSumTerms',
	'cancelFractionFactors',
	'reduceCanceledRoots',
])

export const applyGroupings = new Set<SimplificationOption>([
	...applyCancellations,
	'groupSumTerms',
	'mergeProductFactors',
	'mergeFractionProducts',
	'flattenFractions',
	'mergeFractionFactors',
	'mergeProductsOfRoots',
	'pullExponentsIntoRoots',
])

export const applyExpansions = new Set<SimplificationOption>([
	...applyGroupings,
	'expandMinusSums',
	'expandPlusMinusSums',
	'expandProductsOfSums',
	'mergeFractionSums',
	'mergePowerMinuses',
	'removePowersWithinPowers',
	'expandPowersOfProducts',
	'expandPowersOfFractions',
	'expandPowersOfSums',
])

// Adjust the expansions set by adding and removing various options
export const applyExpansionsOnlyWithinSums = difference(
	union(
		applyExpansions,
		new Set<SimplificationOption>(['expandProductsOfSumsWithinSums', 'expandPowersOfSumsWithinSums'])
	),
	new Set<SimplificationOption>(['expandProductsOfSums', 'expandPowersOfSums']),
)

export const applySorting = new Set<SimplificationOption>([
	'sortSums',
	'sortProducts',
])

export const normalizationRequirements = new Set<SimplificationOption>([
	...removeTrivial,
	...mergeNumbers,
	...applyCancellations,
	...applyGroupings,
	...applyExpansions,
	...applySorting,
])

export const normalize = new Set<SimplificationOption>([
	...normalizationRequirements,
	'normalizeFractionMinuses',
	'applyPolynomialCancellation',
	'removeNegativePowers',
	'turnRootsIntoFractionExponents',
])

export const factorize = new Set<SimplificationOption>([
	...removeTrivial,
	'factorizeIntegers',
	'pullOutCommonSumNumbers',
	'pullOutCommonSumFactors',
	'expandRootsOfProducts',
	'pullFactorsOutOfRoots',
])

export const forDisplay = new Set<SimplificationOption>([
	...removeTrivial,
	...mergeNumbers,
	...applySorting,
	'pullOutCommonSumNumbers',
	'pullOutCommonSumFactors',
	'turnFractionExponentsIntoRoots',
	'pullFactorsOutOfRoots',
	'preventRootDenominators',
])
