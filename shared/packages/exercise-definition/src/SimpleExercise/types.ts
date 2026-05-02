import type { InputExerciseAction, InputExerciseMetaData, InputExercise } from '../InputExercise'

// Update the progress to only allow specific values.
export type SimpleExerciseProgress = Record<string, never> | { solved: true, done: true } | { givenUp: true, done: true }

// Apply within the SimpleExercise type.
export type SimpleExercise = InputExercise<InputExerciseMetaData, InputExerciseAction, SimpleExerciseProgress>
