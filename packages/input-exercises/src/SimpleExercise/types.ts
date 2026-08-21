import type { InputExerciseMetaData, InputExerciseAction, InputExerciseParameters, CheckInputData, InputExercise, InputExerciseSpec, Solution } from '../InputExercise'

export type SimpleExerciseMetaData = InputExerciseMetaData

// Update the progress to only allow specific values.
export type SimpleExerciseProgress = Record<string, never> | { solved: true, done: true } | { givenUp: true, done: true }

// Input checking: verify whether the given input solves the exercise.
export type SimpleExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = (data: CheckInputData<SimpleExerciseMetaData, TParameters, TSolution>) => boolean

// Author-facing definition before the mode-specific reducers are added.
export type SimpleExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExerciseSpec<SimpleExerciseMetaData, TParameters, TSolution> & { checkInput: SimpleExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type SimpleExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExercise<SimpleExerciseMetaData, InputExerciseAction, SimpleExerciseProgress, TParameters, TSolution> & Omit<SimpleExerciseSpec<TParameters, TSolution>, 'generateParameters'> & { type: 'simple' }
