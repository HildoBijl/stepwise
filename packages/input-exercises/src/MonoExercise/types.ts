import type { Awaitable } from '@step-wise/js-utils'
import type { ExerciseMode, GroupExerciseHistory, SoloExerciseHistory } from '@step-wise/exercise-definition'

import type { GroupInputExerciseReport, InputExerciseMetadata, InputExerciseAction, InputExerciseParameters, CheckInputData, CheckInputResult, InputDependency, InputExercise, InputExerciseSpec, InputExerciseSolution, SoloInputExerciseReport } from '../InputExercise/index.ts'
import type { InputExerciseAttemptState, InputExerciseDependencyState } from '../support/reducer.ts'

export type MonoExerciseMetadata = InputExerciseMetadata

// Update the state to only allow specific values.
export type MonoExerciseState = InputExerciseAttemptState & InputExerciseDependencyState & Partial<{ solved: true, givenUp: true, done: true }>
export type MonoExerciseHistoryByMode = {
	solo: SoloExerciseHistory<InputExerciseAction, MonoExerciseState, SoloInputExerciseReport>
	group: GroupExerciseHistory<InputExerciseAction, MonoExerciseState, GroupInputExerciseReport>
}
export type MonoExerciseHistory = MonoExerciseHistoryByMode[ExerciseMode]

// Input checking: verify whether the given input solves the exercise.
export type MonoExerciseCheckInput<TParameters extends InputExerciseParameters = InputExerciseParameters, TInputDependency = InputDependency, TSolution extends InputExerciseSolution = InputExerciseSolution, TContext = undefined> = (data: CheckInputData<MonoExerciseMetadata, TParameters, TInputDependency, TSolution, TContext>) => Awaitable<CheckInputResult>

// Author-facing definition before the mode-specific reducers are added.
export type MonoExerciseSpec<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency, TContext = undefined> = InputExerciseSpec<MonoExerciseMetadata, TParameters, TSolution, TInputDependency, TContext> & { checkInput: MonoExerciseCheckInput<TParameters, TInputDependency, TSolution, TContext> }

// Runtime exercise after the mode-specific reducers are added.
export type MonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency, TContext = undefined> = InputExercise<MonoExerciseMetadata, InputExerciseAction, MonoExerciseState, TParameters, TSolution, TInputDependency, TContext> & Omit<MonoExerciseSpec<TParameters, TSolution, TInputDependency, TContext>, 'generateParameters' | 'valueTypes'> & { type: 'mono' }
