import { ensureBoolean } from '@step-wise/js-utils'
import { type ValueEqualityOptions, type ValueEqualityAdapter, areValuesEqual } from '@step-wise/value-equality'
import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputComparisonSetting } from './types.ts'
import { equalityAdapters } from './objects/index.ts'

type InputValueComparisonOptions = {
	key: string
	type: string
	comparison?: InputComparisonSetting
	data: CheckInputData
}

export function compareInputValue(inputValue: unknown, expectedValue: unknown, options: InputValueComparisonOptions): boolean {
	const { key, type, comparison, data } = options
	if (typeof comparison === 'function') return ensureBoolean(comparison(inputValue, expectedValue, data.solution, data))
	const equality = equalityAdapters[type as keyof typeof equalityAdapters]
	if (equality === undefined) throw new Error(`Invalid compareInputValue call: no equality adapter found for input type "${type}" at key "${key}".`)
	return areValuesEqual(equality as ValueEqualityAdapter<unknown, ValueEqualityOptions>, inputValue, expectedValue, comparison)
}
