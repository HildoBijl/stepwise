import { type SimplificationOption } from './types'
import { getSimplificationOptionsFromSet } from './utils'

// Do nothing.
export const noSimplify = new Set<SimplificationOption>()

// Remove trivial entries.
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

// Reduce numbers
export const reduceNumbers = new Set<SimplificationOption>([
	'mergeSumNumbers',
	'mergeProductNumbers',
	'mergeFractionNumbers',
	'mergePowerNumbers',
	'reduceIntegerRoots',
])

// Cancel terms and factors
export const applyCancellations = new Set<SimplificationOption>([
	...removeTrivial,
	...reduceNumbers,
	'cancelSumTerms',
	'cancelFractionFactors',
	'reduceCanceledRoots',
])

// Apply grouping
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

// Apply expansions
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

export const applySorting = new Set<SimplificationOption>([
	'sortSums',
	'sortProducts',
])

export const normalizeRequirements = new Set<SimplificationOption>([
	...removeTrivial,
	...reduceNumbers,
	...applyCancellations,
	...applyGroupings,
	...applyExpansions,
	...applySorting,
])

export const normalize = new Set<SimplificationOption>([
	...normalizeRequirements,
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

export const applyExpansionsOnlyWithinSums = new Set<SimplificationOption>([
	...applyGroupings,
	'expandMinusSums',
	'expandPlusMinusSums',
	'expandProductsOfSumsWithinSums',
	'mergeFractionSums',
	'mergePowerMinuses',
	'removePowersWithinPowers',
	'expandPowersOfProducts',
	'expandPowersOfFractions',
	'expandPowersOfSumsWithinSums',
])

export const forDisplay = new Set<SimplificationOption>([
	...removeTrivial,
	...reduceNumbers,
	...applySorting,
	'pullOutCommonSumNumbers',
	'pullOutCommonSumFactors',
	'turnFractionExponentsIntoRoots',
	'pullFactorsOutOfRoots',
	'preventRootDenominators',
])
