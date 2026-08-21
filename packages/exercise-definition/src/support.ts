import { type ExerciseAction, type ExerciseProgress } from './fundamentals'
import { type ExerciseHistoryByMode, type ExerciseMode, type GroupExerciseHistory, type SoloExerciseHistory, groupHistorySupport, soloHistorySupport } from './modes'

export function getLastAction<TMode extends ExerciseMode, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(mode: TMode, history: ExerciseHistoryByMode<TAction, TProgress>[TMode], userId?: string): TAction | undefined {
	switch (mode) {
		case 'solo': return soloHistorySupport.getLastAction(history as SoloExerciseHistory<TAction, TProgress>)
		case 'group': return groupHistorySupport.getLastAction(history as GroupExerciseHistory<TAction, TProgress>, userId)
	}
}

export function getLastResolvedAction<TMode extends ExerciseMode, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(mode: TMode, history: ExerciseHistoryByMode<TAction, TProgress>[TMode], userId?: string): TAction | undefined {
	switch (mode) {
		case 'solo': return soloHistorySupport.getLastResolvedAction(history as SoloExerciseHistory<TAction, TProgress>)
		case 'group': return groupHistorySupport.getLastResolvedAction(history as GroupExerciseHistory<TAction, TProgress>, userId)
	}
}

export function getLastProgress<TMode extends ExerciseMode, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(mode: TMode, history: ExerciseHistoryByMode<TAction, TProgress>[TMode]): TProgress | Record<string, never> {
	switch (mode) {
		case 'solo': return soloHistorySupport.getLastProgress(history as SoloExerciseHistory<TAction, TProgress>)
		case 'group': return groupHistorySupport.getLastProgress(history as GroupExerciseHistory<TAction, TProgress>)
	}
}

export function getPreviousProgress<TMode extends ExerciseMode, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(mode: TMode, history: ExerciseHistoryByMode<TAction, TProgress>[TMode]): TProgress | Record<string, never> {
	switch (mode) {
		case 'solo': return soloHistorySupport.getLastProgress(history as SoloExerciseHistory<TAction, TProgress>, 1)
		case 'group': return groupHistorySupport.getLastProgress(history as GroupExerciseHistory<TAction, TProgress>, 1)
	}
}

export function isProgressDone(progress: ExerciseProgress): boolean {
	return progress.done === true
}

export function isHistoryDone<TMode extends ExerciseMode, TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(mode: TMode, history: ExerciseHistoryByMode<TAction, TProgress>[TMode]): boolean {
	return isProgressDone(getLastProgress(mode, history))
}
