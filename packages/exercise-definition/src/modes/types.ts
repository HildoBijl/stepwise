import type { ExerciseAction, ExerciseProgress, ExerciseParameters } from '../atomTypes'

import type { ExerciseMode } from './definitions'
import type { SoloExerciseHistory } from './solo'
import type { GroupExerciseHistory } from './group'

export type ExerciseHistoryByMode<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = {
	solo: SoloExerciseHistory<TAction, TProgress>
	group: GroupExerciseHistory<TAction, TProgress>
}

export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress> = ExerciseHistoryByMode<TAction, TProgress>[ExerciseMode]

export type BaseExerciseInstanceByMode<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = {
	solo: {
		mode: 'solo'
		parameters: TParameters
		history: SoloExerciseHistory<TAction, TProgress>
	}
	group: {
		mode: 'group'
		parameters: TParameters
		history: GroupExerciseHistory<TAction, TProgress>
	}
}

export type BaseExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress, TParameters extends ExerciseParameters = ExerciseParameters> = BaseExerciseInstanceByMode<TAction, TProgress, TParameters>[ExerciseMode]
