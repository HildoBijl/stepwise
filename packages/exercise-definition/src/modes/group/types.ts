import type { ExerciseParameters, ExerciseAction, ExerciseState, GroupExerciseReport } from '../../types.ts'

export type UserExerciseAction<TAction extends ExerciseAction = ExerciseAction> = {
	userId: string
	action: TAction
}

export type ResolvedGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TReport extends GroupExerciseReport = GroupExerciseReport> = {
	actions: readonly UserExerciseAction<TAction>[]
	state: TState
	report?: TReport
}

export type PendingGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction> = {
	actions: readonly UserExerciseAction<TAction>[]
}

export type GroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TReport extends GroupExerciseReport = GroupExerciseReport> = ResolvedGroupExerciseHistoryEvent<TAction, TState, TReport> | PendingGroupExerciseHistoryEvent<TAction>
export type GroupExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TReport extends GroupExerciseReport = GroupExerciseReport> = readonly GroupExerciseHistoryEvent<TAction, TState, TReport>[]

export type GroupExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters, TReport extends GroupExerciseReport = GroupExerciseReport> = {
	mode: 'group'
	parameters: TParameters
	initialState: TState
	history: GroupExerciseHistory<TAction, TState, TReport>
}
