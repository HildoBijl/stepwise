import type { InputExerciseMetadata, InputExerciseAction, InputExerciseParameters, CheckInputData, InputExercise, InputExerciseSpec, Solution } from '../InputExercise'

export type SimpleExerciseMetadata = InputExerciseMetadata

// Update the state to only allow specific values.
export type SimpleExerciseState = Record<string, never> | { solved: true, done: true } | { givenUp: true, done: true }

// Input checking: verify whether the given input solves the exercise.
export type SimpleExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = (data: CheckInputData<SimpleExerciseMetadata, TParameters, TSolution>) => boolean

// Author-facing definition before the mode-specific reducers are added.
export type SimpleExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExerciseSpec<SimpleExerciseMetadata, TParameters, TSolution, SimpleExerciseState> & { checkInput: SimpleExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type SimpleExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExercise<SimpleExerciseMetadata, InputExerciseAction, SimpleExerciseState, TParameters, TSolution> & Omit<SimpleExerciseSpec<TParameters, TSolution>, 'generateParameters' | 'getInitialState'> & { type: 'simple' }
