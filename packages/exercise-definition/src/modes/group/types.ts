import type { ExerciseAction, ExerciseProgress } from '../../atomTypes'

export type GroupExerciseSubmission<TAction extends ExerciseAction = ExerciseAction> = {
	userId?: string
	action: TAction
}

export type ResolvedGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	submissions: readonly GroupExerciseSubmission<TAction>[]
	progress: TProgress
}

export type PendingGroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction> = {
	submissions: readonly GroupExerciseSubmission<TAction>[]
}

export type GroupExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ResolvedGroupExerciseHistoryEvent<TAction, TProgress> | PendingGroupExerciseHistoryEvent<TAction>
export type GroupExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = readonly GroupExerciseHistoryEvent<TAction, TProgress>[]
