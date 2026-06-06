import { union, difference } from '@step-wise/utils'

import type { SimplificationOption } from './types'
import { getSimplificationOptionsObjectFromSet } from './legacyUtils'

/*
 * This legacy file has some old presets that should not be used anymore.
 */

// Do nothing.
export const noSimplifySet = new Set<SimplificationOption>()
export const noSimplifyOptions = getSimplificationOptionsObjectFromSet(noSimplifySet)

// Only fix some structure.
export const structureOnlySet = new Set<SimplificationOption>([
	'turnFloatsIntoIntegers',
	'flattenSums',
	'flattenProducts',
])
export const structureOnlyOptions = getSimplificationOptionsObjectFromSet(structureOnlySet)

// Very elementary clean.
export const elementaryCleanSet = new Set<SimplificationOption>([
	...structureOnlySet,
	'mergeProductMinuses',
	'mergeFractionMinuses',
])
export const elementaryCleanOptions = getSimplificationOptionsObjectFromSet(elementaryCleanSet)

// Remove useless entries.
export const removeUselessSet = new Set<SimplificationOption>([
	...elementaryCleanSet,
	'removeDoubleNegatives',
	'removeSignsFromZeros',
	'removeZeroesFromSums',
	'reduceProductsWithZero',
	'removeOnesFromProducts',
	'reduceFractionsWithZeroNumerator',
	'reduceFractionsWithOneDenominator',
	'reducePowersWithZeroExponent',
	'reducePowersWithZeroBase',
	'removeOneExponentsFromPowers',
	'reducePowersWithOneBase',
	'reduceRootsWithZeroRadicand',
	'reduceRootsWithOneRadicand',
])
export const removeUselessOptions = getSimplificationOptionsObjectFromSet(removeUselessSet)

// Calculate numerical quantities and simplify basic structures.
export const basicCleanSet = new Set<SimplificationOption>([
	...removeUselessSet,
	'mergeSumNumbers',
	'mergeProductNumbers',
	'reduceNumberPowers',
	'mergePowerMinuses',
	'reduceNumberRoots',
	'cancelSumTerms',
	'mergeProductFactors',
	'flattenFractions',
])
export const basicCleanOptions = getSimplificationOptionsObjectFromSet(basicCleanSet)

// Apply all regular algebraic simplifications.
export const regularCleanSet = new Set<SimplificationOption>([
	...basicCleanSet,
	'groupSumTerms',
	'mergeFractionNumbers',
	'cancelFractionFactors',
	'mergeFractionSums',
	'removePowersWithinPowers',
	'convertNegativePowers',
	'reduceCanceledRoots',
	'turnDegreeTwoRootsIntoSqrts',
	'pullExponentsIntoRoots',
	'pullFactorsOutOfRoots',
	'mergeProductsOfRoots',
	'sortProducts',
])
export const regularCleanOptions = getSimplificationOptionsObjectFromSet(regularCleanSet)

// Advanced clean-up: apply all relevant algebraic simplification steps.
export const advancedCleanMainSet = new Set<SimplificationOption>([...regularCleanSet, 'expandPowersOfProducts', 'turnRootsIntoFractionExponents', 'sortSums', 'removeDoubleSigns', 'mergeProductPlusMinuses', 'mergeFractionProducts', 'mergeFractionFactors', 'expandMinusSums', 'expandPlusMinusSums', 'expandProductsOfSums', 'expandPowersOfFractions', 'expandPowersOfSums'])
export const advancedCleanSets = [
	// First pull factors out as much as possible.
	difference(
		union(
			advancedCleanMainSet,
			new Set<SimplificationOption>(['factorizeIntegers', 'pullFactorsOutOfRoots', 'pullOutCommonSumNumbers', 'pullOutCommonSumFactors']),
		),
		new Set<SimplificationOption>(['mergeProductNumbers', 'reduceNumberPowers', 'expandProductsOfSums', 'expandProductsOfSumsWithinSums']),
	),
	// Then try to cancel polynomial factors.
	union(
		advancedCleanMainSet,
		new Set<SimplificationOption>(['expandProductsOfSums', 'expandPowersOfSums', 'applyPolynomialCancellation']),
	),
	// And finally run another advanced clean-up.
	difference(
		union(
			advancedCleanMainSet,
			new Set<SimplificationOption>(['pullOutCommonSumNumbers', 'pullOutCommonSumFactors'])
		),
		new Set<SimplificationOption>(['mergeProductNumbers', 'reduceNumberPowers', 'expandProductsOfSums', 'expandProductsOfSumsWithinSums']),
	),
]
export const advancedCleanOptions = advancedCleanSets.map(set => getSimplificationOptionsObjectFromSet(set))

// Clean for analysis like equality comparisons.
export const forAnalysisMainSet = new Set<SimplificationOption>([...advancedCleanMainSet])
export const forAnalysisSets = [
	// First pull factors out as much as possible. Try to cancel factors with them.
	difference(
		union(
			forAnalysisMainSet,
			new Set<SimplificationOption>(['factorizeIntegers']),
		),
		new Set<SimplificationOption>(['mergeProductNumbers', 'reduceNumberPowers']),
	),
	// Then expand it all again.
	union(
		forAnalysisMainSet,
		new Set<SimplificationOption>(['expandProductsOfSums', 'expandPowersOfSums'])
	),
]
export const forAnalysisOptions = forAnalysisSets.map(set => getSimplificationOptionsObjectFromSet(set))

// Clean for derivatives to make it easier to compute them.
export const forDerivativesSet = new Set<SimplificationOption>([
	...removeUselessSet,
	'turnRootsIntoFractionExponents',
])
export const forDerivativesOptions = getSimplificationOptionsObjectFromSet(forDerivativesSet)

// Clean expressions for display purposes.
export const forDisplaySet = difference(
	union(
		regularCleanSet, // Already clean things a bit in advance.
		new Set<SimplificationOption>(['turnFractionExponentsIntoRoots', 'turnDegreeTwoRootsIntoSqrts', 'mergeProductsOfRoots', 'preventRootDenominators']), // Add some options that make the output prettier.
	),
	new Set<SimplificationOption>(['mergeFractionProducts', 'convertNegativePowers', 'cancelFractionFactors']) // Remove some cleaning options that are not needed for the display purpose.
)
export const forDisplayOptions = getSimplificationOptionsObjectFromSet(forDisplaySet)
