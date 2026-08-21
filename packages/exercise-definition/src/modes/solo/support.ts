import type { ExerciseAction, ExerciseState } from '../../atomTypes'
import type { SoloExerciseHistory } from './types'

function getLastAction<TAction extends ExerciseAction, TState extends ExerciseState>(history: SoloExerciseHistory<TAction, TState>): TAction | undefined {
	return history.at(-1)?.action
}

function getLastState<TAction extends ExerciseAction, TState extends ExerciseState>(history: SoloExerciseHistory<TAction, TState>, offset = 0): TState | Record<string, never> {
	return history.at(-(offset + 1))?.state ?? {}
}

export const soloHistorySupport = {
	getLastAction,
	getLastResolvedAction: getLastAction,
	getLastState,
}
