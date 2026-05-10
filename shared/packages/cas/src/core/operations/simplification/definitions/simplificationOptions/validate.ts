import { mergeDefaults } from '@step-wise/utils'

import { type SimplificationOption, type SimplificationOptions } from './types'
import { noSimplify } from './noSimplify'

export function validateSimplificationOptions(simplificationOptions: Partial<SimplificationOptions>): SimplificationOptions {
	const options = mergeDefaults(simplificationOptions, noSimplify)

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
	conflict(['pullOutCommonSumNumbers', 'pullOutCommonSumFactors'], ['expandProductsOfSums', 'expandProductsOfSums'])

	// Fraction conflicts/dependencies.
	conflict('splitFractions', 'mergeFractionSums')
	requireOption('mergeFractionFactors', 'mergeProductFactors')
	requireOption('normalizeFractionMinuses', ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives'])
	// conflict('pullConstantPartOutOfFractions', 'mergeFractionProducts')
	// conflict('pullConstantPartOutOfFractions', 'removeNegativePowers')

	// // Power conflicts.
	// conflict('expandPowers', 'mergeProductFactors')
	// conflict('removeNegativePowers', 'pullConstantPartOutOfFractions')

	// // Root conflicts/dependencies.
	// conflict('turnRootIntoFractionExponent', 'turnFractionExponentIntoRoot')
	// conflict('expandRootsOfProducts', 'mergeProductsOfRoots')
	// conflict('pullExponentsIntoRoots', 'turnRootIntoFractionExponent')
	// conflict('preventRootDenominators', 'cancelFractionFactors')

	// Log/trig conflicts are currently fine.

	if (errors.length > 0) throw new Error(errors.join('\n'))
	return options
}
