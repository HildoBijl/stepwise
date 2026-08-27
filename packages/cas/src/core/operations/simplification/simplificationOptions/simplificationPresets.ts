import { difference } from '@step-wise/js-utils'

import { normalizationRequirementRules } from '../rules/normalization'

import { type SimplificationOption } from './types'
import { adjustSimplificationOptions, isSimplificationOption } from './utils'

export const flatten = new Set<SimplificationOption>([
	// Excess brackets
	'flattenSums',
	'flattenProducts',

	// Resolve minus confusion
	'combineMinusSignsInProducts',
])

export const removeTrivial = new Set<SimplificationOption>([
	...flatten,

	// Structure
	'convertIntegerFloatsToIntegers',
	'rewriteSquareRootsAsSqrts',

	// Excess minuses
	'removeSignsFromZero',
	'removeDoubleNegatives',

	// Excess plus-minuses.
	'removeDoubleSigns',
	'combinePlusMinusSignsInProducts',

	// Excess zeros
	'removeZeroesFromSums',
	'simplifyZeroProducts',
	'simplifyZeroNumeratorFractions',
	'simplifyZeroExponentPowers',
	'simplifyZeroBasePowers',
	'simplifyZeroRadicandRoots',
	'simplifyUnitArgumentLogarithms',

	// Excess ones
	'removeOnesFromProducts',
	'simplifyUnitDenominatorFractions',
	'simplifyUnitExponentPowers',
	'simplifyUnitBasePowers',
	'simplifyUnitRadicandRoots',
	'simplifyUnitDegreeRoots',
	'simplifyBaseArgumentLogarithms',
])

export const mergeNumbers = new Set<SimplificationOption>([
	...removeTrivial,
	'combineNumbersInSums',
	'combineNumbersInProducts',
	'combineMinusSignsInFractions',
	'combineNumbersInFractions',
	'simplifyUnitDenominatorFractions',
	'combineMinusSignsInPowers',
	'evaluateNumericPowers',
	'evaluateNumericRoots',
])

export const cancel = new Set<SimplificationOption>([
	...mergeNumbers,
	'expandMinusSums',
	'factorMinusSignsOutOfFractionSums',
	'cancelSumTerms',
	'cancelFractionFactors',
	'cancelMatchingRootsAndPowers',
])

export const combine = new Set<SimplificationOption>([
	...cancel,
	'combineLikeTerms',
	'combineLikeFactors',
	'combineProductFractions',
	'flattenFractions',
	'combineFractionFactors',
	'combineNumericFractionsInSums',
	'rewriteNegativePowersAsFractions',
	'flattenNestedPowers',
	'combineRootsInProducts',
	'moveExponentsIntoRoots',
	'reduceRootPowerExponents',
])

export const expand = new Set<SimplificationOption>([
	...combine,
	'expandPlusMinusSums',
	'expandProductsOfSums',
	'combineSumFractions',
	'expandPowersOfProducts',
	'expandPowersOfFractions',
	'expandPowersOfSums',
	'combineProductsWithRoots',
])

export const sort = new Set<SimplificationOption>([
	'sortSums',
	'sortProducts',
])

export const normalizationRequirements = new Set<SimplificationOption>(normalizationRequirementRules.map(rule => rule.name).filter(isSimplificationOption))

export const normalize = new Set<SimplificationOption>([
	...normalizationRequirements,
	'normalizeFractionSigns',
	'cancelPolynomialFactors',
	'rewriteRootsAsFractionalPowers',
])

export const factorize = new Set<SimplificationOption>([
	...removeTrivial,
	'combineNumbersInSums',
	'cancelSumTerms',
	'expandMinusSums',
	'simplifyZeroExponentPowers',
	'removeOnesFromProducts',
	'factorizeIntegers',
	'combineLikeFactors',
	'factorCommonNumericTerms',
	'factorCommonFactors',
	'expandRootsOfProducts',
	'extractFactorsFromRoots',
])

export const format = difference(new Set<SimplificationOption>([
	...combine,
	...sort,
	'expandMinusSums',
	'combineLikeFactors',
	'cancelSumTerms',
	'factorCommonNumericTerms',
	'factorCommonFactors',
	'rewriteFractionalPowersAsRoots',
	'extractFactorsFromRoots',
	// 'rationalizeRootDenominators',
]), new Set<SimplificationOption>(['expandProductsOfSums', 'combineFractionFactors', 'combineLikeFactors', 'combineRootsInProducts', 'combineProductsWithRoots', 'reduceRootPowerExponents']))
