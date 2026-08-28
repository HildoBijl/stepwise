import { ensureBoolean } from '@step-wise/js-utils'

import type { CheckInputData } from '@step-wise/input-exercises'

import type { InputComparisonSetting } from './types.ts'
import { compareFunctions } from './objects/index.ts'

type InputValueComparisonOptions = {
	key: string
	type: string
	comparison?: InputComparisonSetting
	data: CheckInputData
}

export function compareInputValue(inputValue: unknown, expectedValue: unknown, options: InputValueComparisonOptions): boolean {
	const { key, type, comparison, data } = options
	if (typeof comparison === 'function') return ensureBoolean(comparison(inputValue, expectedValue, data.solution, data))
	const compareFunction = compareFunctions[type as keyof typeof compareFunctions]
	if (compareFunction === undefined) throw new Error(`Invalid compareInputValue call: no compare function found for input type "${type}" at key "${key}".`)
	return compareFunction(inputValue as never, expectedValue as never, comparison ?? {})
}
