import { hasOneToOneMatching } from '@step-wise/js-utils'
import type { CheckInputData } from '@step-wise/input-exercises'

import { compareInputEntry } from './compareInputEntry.ts'
import type { InputKey } from './types.ts'

export function compareInputList<TData extends CheckInputData>(keys: readonly InputKey<TData>[], data: TData): boolean {
	if (keys.length === 0) throw new RangeError(`Invalid compareInputList call: expected at least one key.`)
	const types = keys.map(key => {
		if (!(key in data.rawInput)) throw new Error(`Invalid compareInputList call: did not find an input for key "${key}".`)
		return data.rawInput[key].type
	})
	if (!types.every(type => type === types[0])) throw new TypeError(`Invalid compareInputList call: all input values in a list comparison must have the same type.`)
	return hasOneToOneMatching(keys, keys, (inputKey, solutionKey) => compareInputEntry(inputKey, solutionKey, data))
}
