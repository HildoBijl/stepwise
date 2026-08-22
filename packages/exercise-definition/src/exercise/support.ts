import { isPlainObject } from '@step-wise/js-utils'

import type { ExerciseParameters, ExerciseState } from '../atomTypes'

export function resolveExerciseParameters<TParameters extends Record<string, unknown> = ExerciseParameters>(generateParameters: ((example: boolean) => TParameters) | undefined, example: boolean): TParameters {
	const parameters = generateParameters === undefined ? {} : generateParameters(example)
	if (!isPlainObject(parameters)) throw new TypeError(`Invalid exercise parameters: expected generateParameters to return a plain object but received something of type "${typeof parameters}".`)
	return parameters as TParameters
}

export function resolveInitialState<TParameters extends Record<string, unknown> = ExerciseParameters, TState extends ExerciseState = ExerciseState>(getInitialState: ((parameters: TParameters) => TState) | undefined, parameters: TParameters): TState {
	const initialState = getInitialState === undefined ? {} : getInitialState(parameters)
	if (!isPlainObject(initialState)) throw new TypeError(`Invalid initial exercise state: expected getInitialState to return a plain object but received something of type "${typeof initialState}".`)
	return initialState as TState
}
