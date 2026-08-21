import { type ExerciseAction, type ExerciseProgress } from './atomTypes'
import { type BaseExerciseInstance, groupHistorySupport, soloHistorySupport } from './modes'

export function getLastAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(instance: BaseExerciseInstance<TAction, TProgress>, userId?: string): TAction | undefined {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastAction(instance.history)
		case 'group': return groupHistorySupport.getLastAction(instance.history, userId)
	}
}

export function getLastResolvedAction<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(instance: BaseExerciseInstance<TAction, TProgress>, userId?: string): TAction | undefined {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastResolvedAction(instance.history)
		case 'group': return groupHistorySupport.getLastResolvedAction(instance.history, userId)
	}
}

export function getLastProgress<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(instance: BaseExerciseInstance<TAction, TProgress>): TProgress | Record<string, never> {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastProgress(instance.history)
		case 'group': return groupHistorySupport.getLastProgress(instance.history)
	}
}

export function getPreviousProgress<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(instance: BaseExerciseInstance<TAction, TProgress>): TProgress | Record<string, never> {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastProgress(instance.history, 1)
		case 'group': return groupHistorySupport.getLastProgress(instance.history, 1)
	}
}

export function isProgressDone(progress: ExerciseProgress): boolean {
	return progress.done === true
}

export function isHistoryDone<TAction extends ExerciseAction = ExerciseAction, TProgress extends ExerciseProgress = ExerciseProgress>(instance: BaseExerciseInstance<TAction, TProgress>): boolean {
	return isProgressDone(getLastProgress(instance))
}
