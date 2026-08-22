import type { ExerciseAction, ExerciseState, ExerciseParameters } from '../atomTypes'

import type { ExerciseMode } from './definitions'
import type { SoloExerciseHistory } from './solo'
import type { GroupExerciseHistory } from './group'

export type ExerciseHistoryByMode<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = {
	solo: SoloExerciseHistory<TAction, TState>
	group: GroupExerciseHistory<TAction, TState>
}

export type ExerciseHistory<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState> = ExerciseHistoryByMode<TAction, TState>[ExerciseMode]

export type BaseExerciseInstanceByMode<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = {
	solo: {
		mode: 'solo'
		parameters: TParameters
		initialState: TState
		history: SoloExerciseHistory<TAction, TState>
	}
	group: {
		mode: 'group'
		parameters: TParameters
		initialState: TState
		history: GroupExerciseHistory<TAction, TState>
	}
}

export type BaseExerciseInstance<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState, TParameters extends ExerciseParameters = ExerciseParameters> = BaseExerciseInstanceByMode<TAction, TState, TParameters>[ExerciseMode]
