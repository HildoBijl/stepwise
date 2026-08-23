import type { CheckInputData } from '@step-wise/input-exercises'

// Define the compare functions that can be given for various types.
export type TypeCompareOptions = Record<string, unknown>
export type TypeCompareFunction = (inputValue: unknown, expectedValue: unknown, options: TypeCompareOptions) => boolean

// Define the compare functions/options that can be given in exercises to compare an input with its correct value.
export type InputComparisonOptions = TypeCompareOptions
export type InputComparisonFunction = (inputValue: unknown, expectedValue: unknown, solution: unknown, data: CheckInputData) => boolean
export type InputComparisonSetting = InputComparisonOptions | InputComparisonFunction

// Define which kinds of keys we can expect in the input.
export type InputKey<TData extends CheckInputData> = keyof TData['input'] & string
