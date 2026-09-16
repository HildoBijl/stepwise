import { type Awaitable, isPlainObject } from '@step-wise/js-utils'

import type { ExerciseParameters, ExerciseState } from '../types.ts'

import type { GenerateExerciseParametersInput, GetInitialStateInput } from './types.ts'

export async function resolveExerciseParameters<TParameters extends ExerciseParameters = ExerciseParameters, TContext = undefined>(generateParameters: ((input: GenerateExerciseParametersInput<TContext>) => Awaitable<TParameters>) | undefined, input: GenerateExerciseParametersInput<TContext>): Promise<TParameters> {
	const parameters = generateParameters === undefined ? {} : await generateParameters(input)
	if (!isPlainObject(parameters)) throw new TypeError(`Invalid exercise parameters: expected generateParameters to return a plain object but received something of type "${typeof parameters}".`)
	return parameters as TParameters
}

export async function resolveInitialState<TParameters extends ExerciseParameters = ExerciseParameters, TState extends ExerciseState = ExerciseState, TContext = undefined>(getInitialState: ((input: GetInitialStateInput<TParameters, TContext>) => Awaitable<TState>) | undefined, input: GetInitialStateInput<TParameters, TContext>): Promise<TState> {
	const initialState = getInitialState === undefined ? {} : await getInitialState(input)
	if (!isPlainObject(initialState)) throw new TypeError(`Invalid initial exercise state: expected getInitialState to return a plain object but received something of type "${typeof initialState}".`)
	return initialState as TState
}
