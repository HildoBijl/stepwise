import { type Awaitable, isPlainObject } from '@step-wise/js-utils'

import type { ExerciseParameters, ExerciseState } from '../types.ts'

export async function resolveExerciseParameters<TParameters extends Record<string, unknown> = ExerciseParameters>(generateParameters: ((example: boolean) => Awaitable<TParameters>) | undefined, example: boolean): Promise<TParameters> {
	const parameters = generateParameters === undefined ? {} : await generateParameters(example)
	if (!isPlainObject(parameters)) throw new TypeError(`Invalid exercise parameters: expected generateParameters to return a plain object but received something of type "${typeof parameters}".`)
	return parameters as TParameters
}

export async function resolveInitialState<TParameters extends Record<string, unknown> = ExerciseParameters, TState extends ExerciseState = ExerciseState>(getInitialState: ((parameters: TParameters) => Awaitable<TState>) | undefined, parameters: TParameters): Promise<TState> {
	const initialState = getInitialState === undefined ? {} : await getInitialState(parameters)
	if (!isPlainObject(initialState)) throw new TypeError(`Invalid initial exercise state: expected getInitialState to return a plain object but received something of type "${typeof initialState}".`)
	return initialState as TState
}
