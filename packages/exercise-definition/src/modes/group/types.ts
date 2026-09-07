import type { ExerciseParameters, ExerciseAction, ExerciseState } from '../../atomTypes.ts'

export type UserExerciseAction<TAction extends ExerciseAction = ExerciseAction> = {
	userId: string
	action: TAction
}

export type ResolvedGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = {
	actions: readonly UserExerciseAction<TAction>[]
	state: TState
}

export type PendingGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction> = {
	actions: readonly UserExerciseAction<TAction>[]
}

export type GroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = ResolvedGroupExerciseHistoryEvent<TAction, TState> | PendingGroupExerciseHistoryEvent<TAction>
export type GroupExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = readonly GroupExerciseHistoryEvent<TAction, TState>[]

export type GroupExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = {
	mode: 'group'
	parameters: TParameters
	initialState: TState
	history: GroupExerciseHistory<TAction, TState>
}
