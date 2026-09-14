import type { ExerciseParameters, ExerciseAction, ExerciseState, ExerciseReport } from '../atomTypes.ts'

import type { ExerciseMode } from './definitions.ts'
import type { SoloExerciseHistory, SoloExerciseInstance } from './solo/index.ts'
import type { GroupExerciseHistory, GroupExerciseInstance } from './group/index.ts'

export type ExerciseHistoryByMode<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TReport extends ExerciseReport = ExerciseReport> = {
	solo: SoloExerciseHistory<TAction, TState, TReport>
	group: GroupExerciseHistory<TAction, TState, TReport>
}

export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TReport extends ExerciseReport = ExerciseReport> = ExerciseHistoryByMode<TAction, TState, TReport>[ExerciseMode]

export type BaseExerciseInstanceByMode<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends ExerciseReport = ExerciseReport> = {
	solo: SoloExerciseInstance<TAction, TState, TParameters, TReport>
	group: GroupExerciseInstance<TAction, TState, TParameters, TReport>
}

export type BaseExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends ExerciseReport = ExerciseReport> = BaseExerciseInstanceByMode<TAction, TState, TParameters, TReport>[ExerciseMode]
