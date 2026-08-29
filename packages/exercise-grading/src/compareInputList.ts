import { hasOneToOneMatching } from '@step-wise/js-utils'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputKey } from './types.ts'
import { compareInputValue } from './compareInputValue.ts'
import { resolveInputComparison } from './inputComparisons.ts'

export function compareInputList<TData extends CheckInputData>(keys: readonly InputKey<TData>[], data: TData): boolean {
	const { rawInput, input, solution } = data

	// Check the input.
	if (solution === undefined) throw new Error(`Invalid compareInputList call: cannot compare values for an exercise that has no solution defined.`)
	if (keys.length === 0) throw new RangeError(`Invalid compareInputList call: expected at least one key.`)
	for (const key of keys) {
		if (!(key in rawInput) || !(key in input)) throw new Error(`Invalid compareInputList call: did not find an input for key "${key}".`)
		if (!(key in solution)) throw new Error(`Invalid compareInputList call: the solution did not contain a parameter with key "${key}".`)
	}
	const type = rawInput[keys[0]].type
	if (!keys.every(key => rawInput[key].type === type)) throw new TypeError(`Invalid compareInputList call: all input values in a list comparison must have the same type.`)

	// Check if a matching is present.
	return hasOneToOneMatching(keys, keys, (inputKey, solutionKey) => compareInputListEntry(inputKey, solutionKey, data))
}

export function compareInputListEntry<TData extends CheckInputData>(inputKey: InputKey<TData>, solutionKey: InputKey<TData>, data: TData): boolean {
	const { rawInput, input, solution } = data

	// Check the input.
	if (solution === undefined) throw new Error(`Invalid compareInputListEntry call: cannot compare values for an exercise that has no solution defined.`)
	if (!(inputKey in rawInput) || !(inputKey in input)) throw new Error(`Invalid compareInputListEntry call: did not find an input for key "${inputKey}".`)
	if (!(solutionKey in solution)) throw new Error(`Invalid compareInputListEntry call: the solution did not contain a parameter with key "${solutionKey}".`)

	// Check for equality.
	const type = rawInput[inputKey].type
	if (solutionKey in rawInput && rawInput[solutionKey].type !== type) throw new TypeError(`Invalid compareInputListEntry call: both list entries must have the same type.`)
	const inputValue = input[inputKey]
	const expectedValue = solution[solutionKey]
	const inputComparison = resolveInputComparison(solutionKey, type, data)
	return compareInputValue(inputValue, expectedValue, { key: solutionKey, type, comparison: inputComparison, data })
}
