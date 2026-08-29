import type { CheckInputData } from '@step-wise/input-exercises'
import type { ValueEqualityOptions } from '@step-wise/value-equality'

// Define the legacy compare-function shape used by the temporary built-in registry.
export type TypeCompareOptions = ValueEqualityOptions
export type TypeCompareFunction = (inputValue: unknown, expectedValue: unknown, options: TypeCompareOptions) => boolean

// Define the compare functions/options that can be given in exercises to compare an input with its correct value.
export type InputComparisonOptions = ValueEqualityOptions
export type InputComparisonFunction = (inputValue: unknown, expectedValue: unknown, solution: unknown, data: CheckInputData) => boolean
export type InputComparisonSetting = InputComparisonOptions | InputComparisonFunction

// Define which kinds of keys we can expect in the input.
export type InputKey<TData extends CheckInputData> = keyof TData['input'] & string
