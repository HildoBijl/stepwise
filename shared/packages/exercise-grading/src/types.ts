import type { CheckInputData, InputExerciseMetaData } from '@step-wise/input-exercises'

// Define the compare functions that can be given for various types.
export type CompareOptions = Record<string, unknown>
export type TypeCompareFunction = (input: unknown, correct: unknown, options: CompareOptions) => boolean

// Define the compare functions that can be given in exercises to compare an input with its correct value.
export type CompareFunction = (input: unknown, correct: unknown, solution: unknown, data: CheckInputData) => boolean
export type CompareSetting = CompareFunction | CompareOptions
export type GradedExerciseMetaData = InputExerciseMetaData<CompareSetting>
