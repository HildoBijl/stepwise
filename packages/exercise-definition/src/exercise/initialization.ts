import { isPlainObject } from '@step-wise/js-utils'

import type { ExerciseParameters, ExerciseState } from '../types.ts'

import type { GenerateExerciseParameters, GenerateExerciseParametersInput, GetInitialState, GetInitialStateInput } from './types.ts'

export async function resolveExerciseParameters<TParameters extends ExerciseParameters = ExerciseParameters, TContext = undefined>(generateParameters: GenerateExerciseParameters<TParameters, TContext> | undefined, input: GenerateExerciseParametersInput<TContext>): Promise<TParameters> {
	const parameters = generateParameters === undefined ? {} : await generateParameters(input)
	if (!isPlainObject(parameters)) throw new TypeError(`Invalid exercise parameters: expected generateParameters to return a plain object but received something of type "${typeof parameters}".`)
	return parameters as TParameters
}

export async function resolveInitialState<TParameters extends ExerciseParameters = ExerciseParameters, TState extends ExerciseState = ExerciseState, TContext = undefined>(getInitialState: GetInitialState<TParameters, TState, TContext> | undefined, input: GetInitialStateInput<TParameters, TContext>): Promise<TState> {
	const initialState = getInitialState === undefined ? {} : await getInitialState(input)
	if (!isPlainObject(initialState)) throw new TypeError(`Invalid initial exercise state: expected getInitialState to return a plain object but received something of type "${typeof initialState}".`)
	return initialState as TState
}
