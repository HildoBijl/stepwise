import type { ExerciseAction, ExerciseState } from '../../atomTypes'

export type SoloExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = {
	action: TAction
	state: TState
}

export type SoloExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = readonly SoloExerciseHistoryEvent<TAction, TState>[]
