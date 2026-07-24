import type { CheckInputData } from '@step-wise/input-exercises'

// Define the compare functions that can be given for various types.
export type TypeCompareOptions = Record<string, unknown>
export type TypeCompareFunction = (input: unknown, correct: unknown, options: TypeCompareOptions) => boolean

// Define the compare functions/options that can be given in exercises to compare an input with its correct value.
export type CompareOptions = TypeCompareOptions
export type CompareFunction = (input: unknown, correct: unknown, solution: unknown, data: CheckInputData) => boolean
export type CompareSetting = CompareOptions | CompareFunction

// Define which kinds of keys we can expect in the input.
export type InputKey<TData extends CheckInputData> = keyof TData['input'] & string
