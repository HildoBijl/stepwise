import type { ExerciseAction, ExerciseProgress, ExerciseState } from '../atomTypes'

import type { ExerciseMode } from './definitions'
import type { SoloExerciseHistory } from './solo'
import type { GroupExerciseHistory } from './group'

export type ExerciseHistoryByMode<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	solo: SoloExerciseHistory<TAction, TProgress>
	group: GroupExerciseHistory<TAction, TProgress>
}

export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ExerciseHistoryByMode<TAction, TProgress>[ExerciseMode]

export type BaseExerciseInstanceByMode<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress, TState extends ExerciseState = ExerciseState> = {
	solo: {
		mode: 'solo'
		state: TState
		history: SoloExerciseHistory<TAction, TProgress>
	}
	group: {
		mode: 'group'
		state: TState
		history: GroupExerciseHistory<TAction, TProgress>
	}
}

export type BaseExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress, TState extends ExerciseState = ExerciseState> = BaseExerciseInstanceByMode<TAction, TProgress, TState>[ExerciseMode]
