import { mapValues } from '@step-wise/js-utils'
import { type InputValue, interpretInputValue } from '@step-wise/input-interpretation'

import type { InputComparisonSetting } from './types.ts'

export function makeCheckInputData(rawInput: Record<string, InputValue>, solution: Record<string, unknown> | undefined, comparisons: Record<string, InputComparisonSetting> = {}) {
	return {
		metadata: { comparisons },
		parameters: {},
		rawInput,
		input: mapValues(rawInput, value => interpretInputValue(value)),
		solution,
		equalityAdapters: {},
	}
}
