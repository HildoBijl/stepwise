import { type ExerciseAction, type ExerciseState } from './atomTypes'
import { type BaseExerciseInstance, getCurrentState } from './modes'

export function isStateDone(state: ExerciseState): boolean {
	return state.done === true
}

export function isExerciseDone<TAction extends ExerciseAction = ExerciseAction, TState extends ExerciseState = ExerciseState>(instance: BaseExerciseInstance<TAction, TState>): boolean {
	return isStateDone(getCurrentState(instance))
}
