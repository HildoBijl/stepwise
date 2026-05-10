import { type SimplificationOptions, noSimplify } from './simplificationOptions'

export const structureOnly: SimplificationOptions = {
	...noSimplify,
	turnFloatsIntoIntegers: true,
	flattenSums: true,
	flattenProducts: true,
}

export const elementaryClean: SimplificationOptions = {
	...structureOnly,
	mergeFractionProducts: true,
	mergeProductMinuses: true,
	mergeProductPlusMinuses: true,
}

export const removeUseless: SimplificationOptions = {
	...elementaryClean,
	removePlusZeroFromSums: true,
	removeTimesZeroFromProduct: true,
	removeTimesOneFromProducts: true,
	removeZeroNumeratorFromFractions: true,
	removeOneDenominatorFromFractions: true,
	removeZeroExponentFromPower: true,
	removeZeroBaseFromPower: true,
	removeOneExponentFromPower: true,
	removeOneBaseFromPower: true,
	removeZeroRoot: true,
	removeOneRoot: true,
	removeOneLogarithm: true,
}

export const basicClean: SimplificationOptions = {
	...removeUseless,
	mergeSumNumbers: true,
	mergeProductNumbers: true,
	mergePowerNumbers: true,
	cancelSumTerms: true,
	mergeProductFactors: true,
	flattenFractions: true,
	removeIntegerRoot: true,
}

export const regularClean: SimplificationOptions = {
	...basicClean,
	sortProducts: true,
	groupSumTerms: true,
	cancelFractionNumbers: true,
	cancelFractionFactors: true,
	mergeFractionSums: true,
	removePowersWithinPowers: true,
	removeNegativePowers: true,
	removeCanceledRoot: true,
	turnBaseTwoRootIntoSqrt: true,
	pullExponentsIntoRoots: true,
	pullFactorsOutOfRoots: true,
	mergeProductsOfRoots: true,
	removeEqualBaseArgumentLogarithm: true,
}

const advancedCleanMain: SimplificationOptions = {
	...regularClean,
	sortSums: true,
	expandPowersOfProducts: true,
	turnRootIntoFractionExponent: true,
	remove01TrigFunctions: true,
	removeRootTrigFunctions: true,
}

export const advancedClean: readonly SimplificationOptions[] = [
	{
		...advancedCleanMain,
		factorizeIntegers: true,
		mergeProductNumbers: false,
		mergePowerNumbers: false,
		pullFactorsOutOfRoots: true,
		pullOutCommonSumNumbers: true,
		pullOutCommonSumFactors: true,
	},
	{
		...advancedCleanMain,
		expandProductsOfSumsWithinSums: true,
		// expandPowersOfSumsWithinSums: true, // Do not expand powers; this can get huge quickly.
		applyPolynomialCancellation: true,
	},
	{
		...advancedCleanMain,
		pullOutCommonSumNumbers: true,
		pullOutCommonSumFactors: true,
	},
]

const forAnalysisMain: SimplificationOptions = {
	...advancedCleanMain,
	turnLogIntoLn: true,
	turnTanIntoSinCos: true,
}

export const forAnalysis: readonly SimplificationOptions[] = [
	{
		...forAnalysisMain,
		factorizeIntegers: true,
		mergeProductNumbers: false,
		mergePowerNumbers: false,
	},
	{
		...forAnalysisMain,
		expandProductsOfSums: true,
		expandPowersOfSums: true,
	},
]

export const forDerivatives: SimplificationOptions = {
	...removeUseless,
	turnRootIntoFractionExponent: true,
	turnLogIntoLn: true,
	turnTanIntoSinCos: true,
}

export const forDisplay: SimplificationOptions = {
	...regularClean,
	mergeFractionProducts: false,
	removeNegativePowers: false,
	turnFractionExponentIntoRoot: true,
	turnBaseTwoRootIntoSqrt: true,
	mergeProductsOfRoots: true,
	preventRootDenominators: true,
	cancelFractionFactors: false,
}
