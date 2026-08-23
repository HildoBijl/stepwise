import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputKey } from './types'
import { compareValues } from './compareValues'
import { getCompareSetting } from './utils'

export function compare<TData extends CheckInputData>(key: InputKey<TData>, data: TData): boolean
export function compare<TData extends CheckInputData>(keys: InputKey<TData>[], data: TData): boolean
export function compare<TData extends CheckInputData>(keys: InputKey<TData> | InputKey<TData>[], data: TData): boolean {
	const { rawInput, input, solution } = data

	// Check the input.
	if (solution === undefined) throw new Error(`Invalid compare call: cannot compare values for an exercise that has no solution defined.`)
	const keyList = Array.isArray(keys) ? keys : [keys]
	if (keyList.length === 0) throw new RangeError(`Invalid compare call: expected at least one key.`)
	keyList.forEach(key => {
		if (!(key in rawInput) || !(key in input)) throw new Error(`Invalid compare call: did not find an input for key "${key}".`)
		if (!(key in solution)) throw new Error(`Invalid compare call: the solution did not contain a parameter with key "${key}".`)
	})

	// Check for equality.
	return keyList.every(key => {
		const type = rawInput[key].type
		const currInput = input[key]
		const currCorrect = solution[key]
		const compareSetting = getCompareSetting(key, type, data)
		return compareValues(currInput, currCorrect, { key, type, compare: compareSetting, data })
	})
}
