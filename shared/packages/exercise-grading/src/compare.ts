import type { CheckInputData } from '@step-wise/input-exercises'

import type { GradedExerciseMetaData } from './types'
import { compareValues } from './compareValues'

type InputKey<TData extends CheckInputData<GradedExerciseMetaData>> = keyof TData['input'] & string

export function compare<TData extends CheckInputData<GradedExerciseMetaData>>(key: InputKey<TData>, data: TData): boolean
export function compare<TData extends CheckInputData<GradedExerciseMetaData>>(keys: InputKey<TData>[], data: TData): boolean
export function compare<TData extends CheckInputData<GradedExerciseMetaData>>(keys: InputKey<TData> | InputKey<TData>[], data: TData): boolean {
	const { metaData, rawInput, input, solution } = data
	if (solution === undefined) throw new Error(`Invalid compare call: cannot call compare for exercises that have no solution defined.`)
	return (Array.isArray(keys) ? keys : [keys]).every(key => {
		if (!(key in rawInput) || !(key in input)) throw new Error(`Invalid compare call: did not find an input for key "${key}".`)
		if (!(key in solution)) throw new Error(`Invalid compare call: the solution did not contain a parameter with key "${key}".`)
		const type = rawInput[key].type
		const currInput = input[key]
		const currCorrect = solution[key]
		const compareSetting = metaData.compare?.[key] ?? metaData.compare?.[type]
		return compareValues(currInput, currCorrect, { key, type, compare: compareSetting, data })
	})
}
