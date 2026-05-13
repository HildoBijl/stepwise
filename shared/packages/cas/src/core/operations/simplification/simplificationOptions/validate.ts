import { mergeDefaults } from '@step-wise/utils'

import { type SimplificationOption, type SimplificationOptions } from './types'
import { normalizationRequirements } from './presets'
import { defaultSimplificationOptions } from './utils'

export function validateSimplificationOptions(simplificationOptions: Partial<SimplificationOptions>): SimplificationOptions {
	const options = mergeDefaults(simplificationOptions, defaultSimplificationOptions)

	// Define handlers to register conflicts.
	const errors: string[] = []
	const requireOption = (extraOptions: SimplificationOption | SimplificationOption[], requiredOptions: SimplificationOption | SimplificationOption[]) => {
		(Array.isArray(extraOptions) ? extraOptions : [extraOptions]).forEach(extraOption => {
			(Array.isArray(requiredOptions) ? requiredOptions : [requiredOptions]).forEach(requiredOption => {
				if (options[extraOption] && !options[requiredOption]) errors.push(`Invalid simplification options: "${extraOption}" requires "${requiredOption}" to also be enabled.`)
			})
		})
	}
	const conflict = (a: SimplificationOption | SimplificationOption[], b: SimplificationOption | SimplificationOption[]) => {
		(Array.isArray(a) ? a : [a]).forEach(aItem => {
			(Array.isArray(b) ? b : [b]).forEach(bItem => {
				if (options[aItem] && options[bItem]) errors.push(`Invalid simplification options: "${aItem}" conflicts with "${bItem}".`)
			})
		})
	}

	// Sign option requirements.
	requireOption('removeDoublePlusMinusSigns', 'removeDoubleNegatives')
	requireOption('mergeProductPlusMinuses', 'mergeProductMinuses')

	// Expansion/factorization conflicts.
	conflict('factorizeIntegers', ['mergeProductNumbers', 'mergePowerNumbers'])
	conflict(['pullOutCommonSumNumbers', 'pullOutCommonSumFactors'], ['expandProductsOfSums', 'expandProductsOfSumsWithinSums'])

	// Fraction conflicts/requirements.
	conflict('splitFractions', 'mergeFractionSums')
	requireOption('mergeFractionFactors', 'mergeProductFactors')
	requireOption('normalizeFractionMinuses', ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives'])
	requireOption('applyPolynomialCancellation', [...normalizationRequirements])

	// Power conflicts.
	conflict('expandPowers', 'mergeProductFactors')

	// Root conflicts/dependencies.
	conflict('turnBaseTwoRootsIntoSqrts', 'turnSqrtsIntoBaseTwoRoots')
	conflict('expandRootsOfProducts', 'mergeProductsOfRoots')
	conflict('preventRootDenominators', 'cancelFractionFactors')

	// Expand only within sums conflicts.
	conflict('expandProductsOfSumsWithinSums', 'expandProductsOfSums')
	conflict('expandPowersOfSumsWithinSums', 'expandPowersOfSums')

	// Throw any encountered errors.
	if (errors.length > 0) throw new Error(errors.join('\n'))
	return options
}
