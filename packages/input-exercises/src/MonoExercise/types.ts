import type { InputExerciseMetadata, InputExerciseAction, InputExerciseAttemptState, InputExerciseParameters, CheckInputData, InputExercise, InputExerciseSpec, Solution } from '../InputExercise'

export type MonoExerciseMetadata = InputExerciseMetadata

// Update the state to only allow specific values.
export type MonoExerciseState = InputExerciseAttemptState & Partial<{ solved: true, givenUp: true, done: true }>

// Input checking: verify whether the given input solves the exercise.
export type MonoExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = (data: CheckInputData<MonoExerciseMetadata, TParameters, TSolution>) => boolean

// Author-facing definition before the mode-specific reducers are added.
export type MonoExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExerciseSpec<MonoExerciseMetadata, TParameters, TSolution, MonoExerciseState> & { checkInput: MonoExerciseCheckInput<TParameters, TSolution> }

// Runtime exercise after the mode-specific reducers are added.
export type MonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution> = InputExercise<MonoExerciseMetadata, InputExerciseAction, MonoExerciseState, TParameters, TSolution> & Omit<MonoExerciseSpec<TParameters, TSolution>, 'generateParameters' | 'getInitialState'> & { type: 'mono' }
