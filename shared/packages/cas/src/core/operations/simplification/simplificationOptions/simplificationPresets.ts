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
	'mergeFractionMinuses',

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

	// Excess ones
	'removeOnesFromProducts',
	'reduceFractionsWithOneDenominator',
	'removeOneExponentsFromPowers',
	'reducePowersWithOneBase',
	'reduceRootsWithOneRadicand',
])

export const mergeNumbers = new Set<SimplificationOption>([
	'mergeSumNumbers',
	'mergeProductNumbers',
	'mergeFractionNumbers',
	'reduceFractionsWithOneDenominator',
	'mergePowerNumbers',
	'reduceIntegerRoots',
])

export const cancel = new Set<SimplificationOption>([
	...removeTrivial,
	...mergeNumbers,
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
	'mergeProductsOfRoots',
	'pullExponentsIntoRoots',
])

export const expand = new Set<SimplificationOption>([
	...combine,
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
export const expandOnlyWithinSums = adjustSimplificationOptions(
	expand,
	['expandProductsOfSumsWithinSums', 'expandPowersOfSumsWithinSums'], // To add
	['expandProductsOfSums', 'expandPowersOfSums'], // To remove
)

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
	'convertNegativePowers',
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

export const format = new Set<SimplificationOption>([
	...removeTrivial,
	...mergeNumbers,
	...sort,
	'pullOutCommonSumNumbers',
	'pullOutCommonSumFactors',
	'turnFractionExponentsIntoRoots',
	'pullFactorsOutOfRoots',
	'preventRootDenominators',
])
