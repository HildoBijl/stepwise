import { type NumberEqualityOptionsInput, ensureInteger, isInteger, isNumberEqualityOptionsInput, numbersEqual, resolveNumberEqualityOptions } from '@step-wise/js-utils'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

export function areIntegersEqual(inputValue: number, expectedValue: number, options: NumberEqualityOptionsInput = {}): boolean {
	inputValue = ensureInteger(inputValue)
	expectedValue = ensureInteger(expectedValue)
	const { absoluteTolerance, relativeTolerance } = resolveNumberEqualityOptions(options)
	return numbersEqual(inputValue, expectedValue, { absoluteTolerance, relativeTolerance })
}

export const integerEquality: ValueEqualityAdapter<number, NumberEqualityOptionsInput> = {
	isValue: isInteger,
	isOptions: (options): options is NumberEqualityOptionsInput | undefined => options === undefined || isNumberEqualityOptionsInput(options),
	areEqual: areIntegersEqual,
}
