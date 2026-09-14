import { type ExerciseAction, type ExerciseState } from '../types.ts'

import { soloHistorySupport } from './solo/history.ts'
import { groupHistorySupport } from './group/history.ts'
import { type BaseExerciseInstance } from './types.ts'

/* 
 * Actions.
 */

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

/*
 * States.
 */

export function getCurrentState<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>): TState {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastState(instance.history, instance.initialState)
		case 'group': return groupHistorySupport.getLastState(instance.history, instance.initialState)
	}
}

export function getPreviousState<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>): TState {
	switch (instance.mode) {
		case 'solo': return soloHistorySupport.getLastState(instance.history, instance.initialState, 1)
		case 'group': return groupHistorySupport.getLastState(instance.history, instance.initialState, 1)
	}
}
