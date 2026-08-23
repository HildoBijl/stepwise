import { type NumberEqualityOptionsInput, ensureInteger, numbersEqual, resolveNumberEqualityOptions } from '@step-wise/js-utils'

export function compareInteger(input: number, correct: number, options: NumberEqualityOptionsInput = {}): boolean {
	input = ensureInteger(input)
	correct = ensureInteger(correct)
	const { absoluteTolerance, relativeTolerance } = resolveNumberEqualityOptions(options)
	return numbersEqual(input, correct, { absoluteTolerance, relativeTolerance })
}
