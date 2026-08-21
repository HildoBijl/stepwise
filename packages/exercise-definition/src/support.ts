import { type ExerciseAction, type ExerciseState } from './atomTypes'
import { type BaseExerciseInstance, groupHistorySupport, soloHistorySupport } from './modes'

export function getLastAction<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>, userId?: string): TAction | undefined {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastAction(instance.history)
		case 'group': return groupHistorySupport.getLastAction(instance.history, userId)
	}
}

export function getLastResolvedAction<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>, userId?: string): TAction | undefined {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastResolvedAction(instance.history)
		case 'group': return groupHistorySupport.getLastResolvedAction(instance.history, userId)
	}
}

export function getLastState<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>): TState | Record<string, never> {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastState(instance.history)
		case 'group': return groupHistorySupport.getLastState(instance.history)
	}
}

export function getPreviousState<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>): TState | Record<string, never> {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastState(instance.history, 1)
		case 'group': return groupHistorySupport.getLastState(instance.history, 1)
	}
}

export function isStateDone(state: ExerciseState): boolean {
	return state.done === true
}

export function isHistoryDone<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>): boolean {
	return isStateDone(getLastState(instance))
}
