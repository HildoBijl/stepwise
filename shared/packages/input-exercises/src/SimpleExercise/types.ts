import type { ExerciseState } from '@step-wise/exercise-definition'

import type { InputExerciseMetaData, InputExerciseAction, CheckInputData, InputExercise, InputExerciseSpec, Solution } from '../InputExercise'

export type SimpleExerciseMetaData = InputExerciseMetaData

// Update the progress to only allow specific values.
export type SimpleExerciseProgress = Record<string, never> | { solved: true, done: true } | { givenUp: true, done: true }

// Input checking: verify whether the given input solves the exercise.
export type SimpleExerciseCheckInput<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> = (data: CheckInputData<SimpleExerciseMetaData, TState, TSolution>) => boolean

// Author-facing definition before processAction is added.
export type SimpleExerciseSpec<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> =
	InputExerciseSpec<SimpleExerciseMetaData, TState, TSolution> &
	{ checkInput: SimpleExerciseCheckInput<TState, TSolution> }

// Runtime exercise after processAction is added.
export type SimpleExercise<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution> =
	InputExercise<SimpleExerciseMetaData, InputExerciseAction, SimpleExerciseProgress, TState, TSolution> &
	SimpleExerciseSpec<TState, TSolution> &
	{ type: 'simple' }
