import { type NumberEqualityOptionsInput, numbersEqual, resolveNumberEqualityOptions } from '@step-wise/js-utils'

export function compareInteger(input: number, correct: number, options: NumberEqualityOptionsInput = {}): boolean {
	const { absoluteTolerance, relativeTolerance } = resolveNumberEqualityOptions(options)
	if (typeof input !== 'number' || typeof correct !== 'number') throw new Error(`Invalid integer comparison: received parameters that were not numbers.`)
	return numbersEqual(input, correct, { absoluteTolerance, relativeTolerance })
}
