import type { ExerciseParameters, ExerciseAction, ExerciseState } from '../../atomTypes.ts'

export type SoloExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = {
	action: TAction
	state: TState
}

export type SoloExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = readonly SoloExerciseHistoryEvent<TAction, TState>[]

export type SoloExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = {
	mode: 'solo'
	parameters: TParameters
	initialState: TState
	history: SoloExerciseHistory<TAction, TState>
}
