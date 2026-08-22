import type { ExerciseAction, ExerciseState } from '../../atomTypes'

export type GroupExerciseSubmission<TAction extends ExerciseAction = ExerciseAction> = {
	userId: string
	action: TAction
}

export type ResolvedGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = {
	submissions: readonly GroupExerciseSubmission<TAction>[]
	state: TState
}

export type PendingGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction> = {
	submissions: readonly GroupExerciseSubmission<TAction>[]
}

export type GroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = ResolvedGroupExerciseHistoryEvent<TAction, TState> | PendingGroupExerciseHistoryEvent<TAction>
export type GroupExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = readonly GroupExerciseHistoryEvent<TAction, TState>[]
