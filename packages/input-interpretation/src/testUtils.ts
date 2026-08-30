import type { InputValue, InputValueAdapter, InputValueAdapters } from './types.ts'
import { isInputValueOfType } from './support.ts'

export const TestNumberType = 'TestNumber'
export type TestNumberInputValue = InputValue<typeof TestNumberType, string>

export const testNumberAdapter = {
	isInputValue: (value: unknown): value is TestNumberInputValue => isInputValueOfType(value, TestNumberType, (innerValue): innerValue is string => typeof innerValue === 'string'),
	isDomainValue: (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value),
	interpret: inputValue => Number(inputValue.value),
	toInputValue: value => ({ type: TestNumberType, value: value.toString() }),
} satisfies InputValueAdapter<TestNumberInputValue, number>

export const testInputValueAdapters = { [TestNumberType]: testNumberAdapter } satisfies InputValueAdapters
