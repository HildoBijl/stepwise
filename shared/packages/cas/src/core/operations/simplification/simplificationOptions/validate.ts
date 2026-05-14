import { asArray } from '@step-wise/utils'

import { type SimplificationOption, type SimplificationOptions } from './types'
import { normalizationRequirements } from './presets'
import { ensureSimplificationOptionSet } from './utils'

export function validateSimplificationOptions(options: SimplificationOptions): SimplificationOptions {
	ensureSimplificationOptionSet(options)

	// Define handlers to register conflicts.
	const errors: string[] = []
	const requireOption = (givenOptions: SimplificationOption | readonly SimplificationOption[], requiredOptions: SimplificationOption | readonly SimplificationOption[]): void => {
		for (const extraOption of asArray(givenOptions)) {
			for (const requiredOption of asArray(requiredOptions)) {
				if (options.has(extraOption) && !options.has(requiredOption)) errors.push(`Invalid simplification options: "${extraOption}" requires "${requiredOption}".`)
			}
		}
	}
	const conflict = (a: SimplificationOption | readonly SimplificationOption[], b: SimplificationOption | readonly SimplificationOption[]): void => {
		for (const aItem of asArray(a)) {
			for (const bItem of asArray(b)) {
				if (options.has(aItem) && options.has(bItem)) errors.push(`Invalid simplification options: "${aItem}" conflicts with "${bItem}".`)
			}
		}
	}

	// Sign requirements.
	requireOption('removeDoubleSigns', 'removeDoubleNegatives')
	requireOption('mergeProductPlusMinuses', 'mergeProductMinuses')

	// Fraction requirements.
	requireOption('mergeFractionFactors', 'mergeProductFactors')
	requireOption('normalizeFractionMinuses', ['mergeProductMinuses', 'sortSums', 'removeDoubleNegatives'])
	requireOption('applyPolynomialCancellation', [...normalizationRequirements])

	// Fraction conflicts.
	conflict('splitFractions', 'mergeFractionSums')

	// Power conflicts.
	conflict('expandPowers', 'mergeProductFactors')

	// Expansion/factorization conflicts.
	conflict('factorizeIntegers', ['mergeProductNumbers', 'mergePowerNumbers'])
	conflict(['pullOutCommonSumNumbers', 'pullOutCommonSumFactors'], ['expandProductsOfSums', 'expandProductsOfSumsWithinSums'])

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
