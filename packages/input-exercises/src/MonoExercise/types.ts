import type { Awaitable } from '@step-wise/js-utils'

import type { InputExerciseMetadata, InputExerciseAction, InputExerciseAttemptState, InputExerciseParameters, CheckInputData, InputDependency, InputExercise, InputExerciseSpec, InputExerciseSolution } from '../InputExercise/index.ts'

export type MonoExerciseMetadata = InputExerciseMetadata

// Update the state to only allow specific values.
export type MonoExerciseState = InputExerciseAttemptState & Partial<{ solved: true, givenUp: true, done: true }>

// Input checking: verify whether the given input solves the exercise.
export type MonoExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = (data: CheckInputData<MonoExerciseMetadata, TParameters, TSolution>) => Awaitable<boolean>

// Author-facing definition before the mode-specific reducers are added.
export type MonoExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = InputExerciseSpec<MonoExerciseMetadata, TParameters, TSolution, TInputDependency> & { checkInput: MonoExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type MonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency> = InputExercise<MonoExerciseMetadata, InputExerciseAction, MonoExerciseState, TParameters, TSolution, TInputDependency> & Omit<MonoExerciseSpec<TParameters, TSolution, TInputDependency>, 'generateParameters' | 'valueTypes'> & { type: 'mono' }
