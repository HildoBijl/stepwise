import type { ExerciseAction, ExerciseProgress } from '../../fundamentals'

export type SoloExerciseHistoryEvent<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	action: TAction
	progress: TProgress
}

export type SoloExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = readonly SoloExerciseHistoryEvent<TAction, TProgress>[]
