import type { ExerciseAction, ExerciseProgress } from '../atomTypes'

import type { ExerciseMode } from './definitions'
import type { SoloExerciseHistory } from './solo'
import type { GroupExerciseHistory } from './group'

export type ExerciseHistoryByMode<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	solo: SoloExerciseHistory<TAction, TProgress>
	group: GroupExerciseHistory<TAction, TProgress>
}

export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ExerciseHistoryByMode<TAction, TProgress>[ExerciseMode]
