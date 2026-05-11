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
	reduceProductsWithZero: true,
	removeTimesOneFromProducts: true,
	reduceFractionsWithZeroNumerator: true,
	reduceFractionsWithOneDenominator: true,
	removeZeroExponentFromPowers: true,
	removeZeroBaseFromPowers: true,
	removeOneExponentFromPowers: true,
	removeOneBaseFromPowers: true,
	reduceRootsWithZeroArgument: true,
	reduceRootsWithOneArgument: true,
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
	reduceIntegerRoots: true,
}

export const regularClean: SimplificationOptions = {
	...basicClean,
	sortProducts: true,
	groupSumTerms: true,
	mergeFractionNumbers: true,
	cancelFractionFactors: true,
	mergeFractionSums: true,
	removePowersWithinPowers: true,
	removeNegativePowers: true,
	reduceCanceledRoots: true,
	turnBaseTwoRootsIntoSqrts: true,
	pullExponentsIntoRoots: true,
	pullFactorsOutOfRoots: true,
	mergeProductsOfRoots: true,
	removeEqualBaseArgumentLogarithm: true,
}

const advancedCleanMain: SimplificationOptions = {
	...regularClean,
	sortSums: true,
	expandPowersOfProducts: true,
	turnRootsIntoFractionExponents: true,
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
	turnRootsIntoFractionExponents: true,
	turnLogIntoLn: true,
	turnTanIntoSinCos: true,
}

export const forDisplay: SimplificationOptions = {
	...regularClean,
	mergeFractionProducts: false,
	removeNegativePowers: false,
	turnFractionExponentsIntoRoots: true,
	turnBaseTwoRootsIntoSqrts: true,
	mergeProductsOfRoots: true,
	preventRootDenominators: true,
	cancelFractionFactors: false,
}
