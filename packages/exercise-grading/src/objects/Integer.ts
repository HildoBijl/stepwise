import { type NumberEqualityOptionsInput, ensureInteger, numbersEqual, resolveNumberEqualityOptions } from '@step-wise/js-utils'

export function compareInteger(inputValue: number, expectedValue: number, options: NumberEqualityOptionsInput = {}): boolean {
	inputValue = ensureInteger(inputValue)
	expectedValue = ensureInteger(expectedValue)
	const { absoluteTolerance, relativeTolerance } = resolveNumberEqualityOptions(options)
	return numbersEqual(inputValue, expectedValue, { absoluteTolerance, relativeTolerance })
}
