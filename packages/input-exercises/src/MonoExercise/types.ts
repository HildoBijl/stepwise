import type { InputExerciseMetadata, InputExerciseAction, InputExerciseAttemptState, InputExerciseParameters, CheckInputData, InputExercise, InputExerciseSpec, InputExerciseSolution } from '../InputExercise/index.ts'

export type MonoExerciseMetadata = InputExerciseMetadata

// Update the state to only allow specific values.
export type MonoExerciseState = InputExerciseAttemptState & Partial<{ solved: true, givenUp: true, done: true }>

// Input checking: verify whether the given input solves the exercise.
export type MonoExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = (data: CheckInputData<MonoExerciseMetadata, TParameters, TSolution>) => boolean

// Author-facing definition before the mode-specific reducers are added.
export type MonoExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = InputExerciseSpec<MonoExerciseMetadata, TParameters, TSolution> & { checkInput: MonoExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type MonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution> = InputExercise<MonoExerciseMetadata, InputExerciseAction, MonoExerciseState, TParameters, TSolution> & Omit<MonoExerciseSpec<TParameters, TSolution>, 'generateParameters' | 'valueTypes'> & { type: 'mono' }
