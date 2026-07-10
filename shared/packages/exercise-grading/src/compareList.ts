import { hasOneToOneMatching } from '@step-wise/utils'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { CompareSetting, GradedExerciseMetaData, InputKey } from './types'
import { compareValues } from './compareValues'

export function compareList<TData extends CheckInputData<GradedExerciseMetaData>>(keys: readonly InputKey<TData>[], data: TData): boolean {
	const { metaData, rawInput, input, solution } = data

	// Check the input given.
	if (solution === undefined) throw new Error(`Invalid compareList call: cannot compare values for an exercise that has no solution defined.`)
	for (const key of keys) {
		if (!(key in rawInput) || !(key in input)) throw new Error(`Invalid compareList call: did not find an input for key "${key}".`)
		if (!(key in solution)) throw new Error(`Invalid compareList call: the solution did not contain a parameter with key "${key}".`)
	}

	// Check if a matching is present.
	return hasOneToOneMatching(keys, keys, (inputKey, solutionKey) => {
		const type = rawInput[inputKey].type
		const currInput = input[inputKey]
		const currCorrect = solution[solutionKey]
		const compare = (metaData.compare?.[solutionKey] ?? metaData.compare?.[type]) as CompareSetting | undefined
		return compareValues(currInput, currCorrect, { key: solutionKey, type, compare, data })
	})
}
