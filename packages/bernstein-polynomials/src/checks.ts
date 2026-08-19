import { approximatelyEqual, ensureNumberArray, sum } from '@step-wise/js-utils'

import { type BernsteinCoefficients } from './fundamentals'

export type EnsureBernsteinCoefficientsOptions = {
	requireNormalized?: boolean
}

// Ensure a value is a valid coefficient array: an array of non-negative numbers whose sum equals one. Returns a copied array.
export function ensureBernsteinCoefficients(coefficients: unknown, options: EnsureBernsteinCoefficientsOptions = {}): BernsteinCoefficients {
	const ensuredCoefficients = ensureNumberArray(coefficients, { nonNegative: true })
	if (ensuredCoefficients.length === 0) throw new RangeError('Invalid input: expected a non-empty Bernstein coefficient array.')
	if ((options.requireNormalized ?? true) && !approximatelyEqual(sum(ensuredCoefficients), 1)) throw new Error(`Invalid input: expected a coefficient array whose sum equals one, but the sum instead is ${sum(ensuredCoefficients)}. The array itself is [${ensuredCoefficients.join(', ')}].`)
	return ensuredCoefficients
}
