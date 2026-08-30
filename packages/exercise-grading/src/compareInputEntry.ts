import { ensureBoolean } from '@step-wise/js-utils'
import { type AnyValueEqualityAdapter, areValuesEqual } from '@step-wise/value-equality'
import type { CheckInputData } from '@step-wise/input-exercises'

import { resolveInputComparison } from './inputComparisons.ts'
import { equalityAdapters } from './objects/index.ts'
import type { InputKey } from './types.ts'

export function compareInputEntry<TData extends CheckInputData>(inputKey: InputKey<TData>, solutionKey: InputKey<TData>, data: TData): boolean {

	// Ensure that the input value and expected value exist and are of the same type.
	const { rawInput, input, solution } = data
	if (solution === undefined) throw new Error(`Invalid compareInputEntry call: cannot compare values for an exercise that has no solution defined.`)
	if (!(inputKey in rawInput) || !(inputKey in input)) throw new Error(`Invalid compareInputEntry call: did not find an input for key "${inputKey}".`)
	if (!(solutionKey in solution)) throw new Error(`Invalid compareInputEntry call: the solution did not contain a parameter with key "${solutionKey}".`)

	// Compare the input value and the expected value in the appropriate way.
	const type = rawInput[inputKey].type
	if (solutionKey in rawInput && rawInput[solutionKey].type !== type) throw new TypeError(`Invalid compareInputEntry call: both entries must have the same type.`)
	const inputValue = input[inputKey]
	const expectedValue = solution[solutionKey]
	const comparison = resolveInputComparison(solutionKey, type, data)
	if (typeof comparison === 'function') return ensureBoolean(comparison(inputValue, expectedValue, solution, data))
	return areValuesEqual(getEqualityAdapter(type, data), inputValue, expectedValue, comparison)
}

function getEqualityAdapter(type: string, data: CheckInputData): AnyValueEqualityAdapter {
	const hasCustomAdapter = Object.hasOwn(data.equalityAdapters, type)
	if (hasCustomAdapter && Object.hasOwn(equalityAdapters, type)) throw new Error(`Duplicate equality adapter for input type "${type}".`)
	const adapter: AnyValueEqualityAdapter | undefined = hasCustomAdapter ? data.equalityAdapters[type] : equalityAdapters[type]
	if (adapter === undefined) throw new Error(`Invalid compareInputEntry call: no equality adapter found for input type "${type}".`)
	return adapter
}
