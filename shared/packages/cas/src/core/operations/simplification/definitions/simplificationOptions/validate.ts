import { mergeDefaults } from '@step-wise/utils'

import { type SimplificationOptions } from './types'
import { noSimplify } from './noSimplify'

export function validateSimplificationOptions(simplificationOptions: Partial<SimplificationOptions>): SimplificationOptions {
	const options = mergeDefaults(simplificationOptions, noSimplify)

	// Define handlers to register conflicts.
	const errors: string[] = []
	const requireOption = (option: keyof SimplificationOptions, requiredOption: keyof SimplificationOptions) => {
		if (options[option] && !options[requiredOption]) errors.push(`Invalid simplification options: "${option}" requires "${requiredOption}" to also be enabled.`)
	}
	const conflict = (a: keyof SimplificationOptions, b: keyof SimplificationOptions) => {
		if (options[a] && options[b]) errors.push(`Invalid simplification options: "${a}" conflicts with "${b}".`)
	}

	// Sign dependencies.
	requireOption('removeDoublePlusMinusSigns', 'removeDoubleNegatives')
	requireOption('mergeProductPlusMinuses', 'mergeProductMinuses')

	// Constant conflicts.
	conflict('factorizeIntegers', 'mergeProductNumbers')
	conflict('factorizeIntegers', 'mergePowerNumbers')

	// Sum/product expansion conflicts.
	conflict('cancelSumTerms', 'groupSumTerms')
	conflict('pullOutCommonSumNumbers', 'expandProductsOfSums')
	conflict('pullOutCommonSumNumbers', 'expandPowersOfSums')
	// conflict('pullOutCommonSumFactors', 'expandProductsOfSums')
	// conflict('pullOutCommonSumFactors', 'expandPowersOfSums')

	// // Fraction conflicts/dependencies.
	// conflict('splitFractions', 'mergeFractionSums')
	// requireOption('crossOutFractionFactors', 'mergeProductFactors')
	// conflict('pullConstantPartOutOfFraction', 'mergeFractionProducts')
	// conflict('pullConstantPartOutOfFraction', 'removeNegativePowers')

	// // Power conflicts.
	// conflict('expandPowers', 'mergeProductFactors')
	// conflict('removeNegativePowers', 'pullConstantPartOutOfFraction')

	// // Root conflicts/dependencies.
	// conflict('turnRootIntoFractionExponent', 'turnFractionExponentIntoRoot')
	// conflict('expandRootsOfProducts', 'mergeProductsOfRoots')
	// conflict('pullExponentsIntoRoots', 'turnRootIntoFractionExponent')
	// conflict('preventRootDenominators', 'crossOutFractionFactors')

	// Log/trig conflicts are currently fine.

	if (errors.length > 0) throw new Error(errors.join('\n'))
	return options
}
