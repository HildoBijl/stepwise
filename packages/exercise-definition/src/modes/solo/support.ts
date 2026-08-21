import type { ExerciseAction, ExerciseProgress } from '../../atomTypes'
import type { SoloExerciseHistory } from './types'

function getLastAction<TAction extends ExerciseAction, TProgress extends ExerciseProgress>(history: SoloExerciseHistory<TAction, TProgress>): TAction | undefined {
	return history.at(-1)?.action
}

function getLastProgress<TAction extends ExerciseAction, TProgress extends ExerciseProgress>(history: SoloExerciseHistory<TAction, TProgress>, offset = 0): TProgress | Record<string, never> {
	return history.at(-(offset + 1))?.progress ?? {}
}

export const soloHistorySupport = {
	getLastAction,
	getLastResolvedAction: getLastAction,
	getLastProgress,
}
