import type { ExerciseParameters, ExerciseAction, ExerciseState, SoloExerciseReport } from '../../types.ts'

export type SoloExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TReport extends SoloExerciseReport = SoloExerciseReport> = {
	action: TAction
	state: TState
	report?: TReport
}

export type SoloExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TReport extends SoloExerciseReport = SoloExerciseReport> = readonly SoloExerciseHistoryEvent<TAction, TState, TReport>[]

export type SoloExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends SoloExerciseReport = SoloExerciseReport> = {
	mode: 'solo'
	parameters: TParameters
	initialState: TState
	history: SoloExerciseHistory<TAction, TState, TReport>
}
