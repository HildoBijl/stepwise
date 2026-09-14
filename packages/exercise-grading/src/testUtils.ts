import { mapValues } from '@step-wise/js-utils'
import { type InputValue, interpretInputValue } from '@step-wise/input-interpretation'
import { createAreValuesEqual } from '@step-wise/value-equality'
import { extractValueTypeAdapters, fundamentalValueTypes } from '@step-wise/value-types'

import type { InputComparisonSetting } from './types.ts'

const { inputValueAdapters, equalityAdapters } = extractValueTypeAdapters(fundamentalValueTypes)

export function makeCheckInputData(rawInput: Record<string, InputValue>, solution: Record<string, unknown> | undefined, comparisons: Record<string, InputComparisonSetting> = {}) {
	return {
		metadata: { comparisons },
		parameters: {},
		rawInput,
		input: mapValues(rawInput, value => interpretInputValue(value, inputValueAdapters)),
		solution,
		areValuesEqual: createAreValuesEqual(equalityAdapters),
	}
}
