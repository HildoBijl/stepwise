import { isPlainObject } from '@step-wise/js-utils'

import type { ExerciseParameters } from '../atomTypes'

export function generateExerciseParameters<TParameters extends Record<string, unknown> = ExerciseParameters>(generateParameters: ((example: boolean) => TParameters) | undefined, example: boolean): TParameters {
	const parameters = generateParameters === undefined ? {} : generateParameters(example)
	if (!isPlainObject(parameters)) throw new TypeError(`Invalid exercise parameters: expected generateParameters to return a plain object but received something of type "${typeof parameters}".`)
	return parameters as TParameters
}
