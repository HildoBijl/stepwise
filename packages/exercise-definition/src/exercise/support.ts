import { isPlainObject } from '@step-wise/js-utils'

import type { ExerciseState } from '../atomTypes'

export function generateExerciseState<TState extends Record<string, unknown> = ExerciseState>(generateState: ((example: boolean) => TState) | undefined, example: boolean): TState {
	const state = generateState === undefined ? {} : generateState(example)
	if (!isPlainObject(state)) throw new TypeError(`Invalid exercise state: expected generateState to return a plain object but received something of type "${typeof state}".`)
	return state as TState
}
